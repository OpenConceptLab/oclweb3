import React from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button as MuiButton,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import {
  AccountTreeOutlined as VersionIcon,
  AspectRatio as ExpansionIcon,
  CheckCircleOutline as DefaultIcon,
  EditOutlined as DraftIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  InfoOutlined as InfoIcon,
  NewReleases as ReleaseIcon,
  WarningAmberOutlined as WarningIcon
} from "@mui/icons-material";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import filter from "lodash/filter";
import get from "lodash/get";
import isNumber from "lodash/isNumber";
import { useTranslation } from "react-i18next";

import APIService from "../../services/APIService";
import {
  dropVersion,
  formatDateTime,
  headFirst,
  currentUserHasAccess
} from "../../common/utils";
import { OperationsContext } from "../app/LayoutContext";
import DeleteEntityDialog from "../common/DeleteEntityDialog";
import ExpansionForm from "./ExpansionForm";
import ExpansionDetailsDialog from "./ExpansionDetailsDialog";
import RebuildExpansionDialog from "./RebuildExpansionDialog";

const isHeadVersion = version => (version?.version || version?.id) === "HEAD";

const isStaleExpansion = expansion =>
  Boolean(
    expansion?.is_stale ||
      expansion?.stale ||
      expansion?.extras?.__stale_expansion ||
      expansion?.extras?.stale
  );

const getVersionKey = version =>
  version?.version_url || version?.url || version?.id;

const getVersionEndpoint = version => {
  const versionURL = version?.version_url || version?.url || "";
  return version?.version === "HEAD"
    ? `${dropVersion(versionURL)}HEAD/`
    : versionURL;
};

const matchesByValue = (value, candidates = []) => {
  if (!value) return false;

  const expected = value.toLowerCase();
  return candidates
    .filter(Boolean)
    .some(candidate => String(candidate).toLowerCase() === expected);
};

const findVersionFromQuery = (versions, value) =>
  find(versions, version =>
    matchesByValue(value, [
      version?.version,
      version?.id,
      version?.url,
      version?.version_url
    ])
  );

const findExpansionFromQuery = (expansions, value) =>
  find(expansions, expansion =>
    matchesByValue(value, [expansion?.mnemonic, expansion?.id, expansion?.url])
  );

const formatExpansions = (version, versionExpansions = []) => {
  let expansions = orderBy(
    versionExpansions,
    ["created_on", "id"],
    ["desc", "desc"]
  ).map(expansion => ({ ...expansion, default: false, auto: false }));

  if (version?.autoexpand && expansions.length > 0) {
    const [latestExpansion, ...rest] = expansions;
    expansions = [{ ...latestExpansion, auto: true }, ...rest];
  }

  if (version?.expansion_url) {
    const defaultExpansion = find(expansions, { url: version.expansion_url });
    if (defaultExpansion) {
      expansions = [
        { ...defaultExpansion, default: true },
        ...expansions.filter(
          expansion => expansion.url !== version.expansion_url
        )
      ];
    }
  }

  return expansions;
};

const getUserLabel = user =>
  user?.username ||
  user?.id ||
  user?.name ||
  (typeof user === "string" ? user : "");

const getReferencesCount = entity => {
  const explicitTotal =
    get(entity, "summary.references.total") ?? get(entity, "references.total");
  if (isNumber(explicitTotal)) return explicitTotal;

  const conceptRefs =
    get(entity, "summary.references.concepts") ??
    get(entity, "references.concepts");
  const mappingRefs =
    get(entity, "summary.references.mappings") ??
    get(entity, "references.mappings");
  if (isNumber(conceptRefs) || isNumber(mappingRefs))
    return (conceptRefs || 0) + (mappingRefs || 0);

  return undefined;
};

const SummaryMetric = ({ label, value }) => (
  <Box sx={{ display: "flex", flexDirection: "column", minWidth: "64px" }}>
    <Typography sx={{ fontSize: "11px", color: "secondary.main" }}>
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: "24px",
        fontWeight: 600,
        color: "surface.contrastText",
        lineHeight: 1.2,
        mt: 0.25
      }}
    >
      {isNumber(value) ? value.toLocaleString() : "-"}
    </Typography>
  </Box>
);

const StatusChip = ({
  label,
  color = "default",
  icon = undefined,
  variant = "filled"
}) => (
  <Chip
    size="small"
    icon={icon}
    label={label}
    color={color}
    variant={variant}
    sx={{ borderRadius: "6px", height: "24px", fontWeight: 600 }}
  />
);

const CollectionVersionsTab = ({
  repo,
  versions,
  onCreateVersion,
  onReleaseVersion,
  onDeleteVersion,
  onDataChange
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { setAlert } = React.useContext(OperationsContext);
  const [headVersion, setHeadVersion] = React.useState(
    isHeadVersion(repo) ? repo : null
  );
  const [expandedVersionKey, setExpandedVersionKey] = React.useState(null);
  const [expansionsByVersion, setExpansionsByVersion] = React.useState({});
  const [loadingByVersion, setLoadingByVersion] = React.useState({});
  const [headLoading, setHeadLoading] = React.useState(false);
  const [versionOverrides, setVersionOverrides] = React.useState({});
  const [expansionFormState, setExpansionFormState] = React.useState({
    open: false,
    version: null,
    copyFrom: null
  });
  const [deleteExpansion, setDeleteExpansion] = React.useState(null);
  const [detailsExpansion, setDetailsExpansion] = React.useState(null);
  const [rebuildExpansion, setRebuildExpansion] = React.useState(null);
  const expansionRefs = React.useRef({});
  const hasAccess = currentUserHasAccess();
  const baseRepoURL = dropVersion(repo?.version_url || repo?.url || "");
  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const notificationVersion =
    searchParams.get("version_url") ||
    searchParams.get("version") ||
    searchParams.get("version_id");
  const notificationExpansion =
    searchParams.get("expansion_url") ||
    searchParams.get("expansion") ||
    searchParams.get("expansion_id");
  const dependencyNotification = Boolean(
    notificationVersion ||
      notificationExpansion ||
      ["dependency", "stale"].includes(
        (searchParams.get("notification") || "").toLowerCase()
      )
  );

  React.useEffect(() => {
    if (!baseRepoURL || isHeadVersion(repo)) {
      setHeadVersion(repo);
      return;
    }

    setHeadLoading(true);
    APIService.new()
      .overrideURL(baseRepoURL)
      .get(null, null, { includeSummary: true }, true)
      .then(response => {
        setHeadVersion(response?.data || response?.response?.data || null);
        setHeadLoading(false);
      });
  }, [baseRepoURL, repo]);

  const displayVersions = React.useMemo(() => {
    const head = headVersion
      ? {
          ...headVersion,
          id: "HEAD",
          version: "HEAD",
          version_url: headVersion.url || headVersion.version_url || baseRepoURL
        }
      : null;
    const versionList = uniqBy(
      [head, ...(versions || [])].filter(Boolean).map(version => ({
        ...version,
        ...(versionOverrides[getVersionKey(version)] || {})
      })),
      version => getVersionKey(version)
    );
    return headFirst(orderBy(versionList, ["created_on"], ["desc"]));
  }, [baseRepoURL, headVersion, versionOverrides, versions]);

  const fetchExpansions = React.useCallback(
    (version, force = false) => {
      const versionKey = getVersionKey(version);
      if (
        !versionKey ||
        loadingByVersion[versionKey] ||
        (!force && expansionsByVersion[versionKey])
      )
        return;

      const versionURL = getVersionEndpoint(version);
      if (!versionURL) return;

      setLoadingByVersion(prev => ({ ...prev, [versionKey]: true }));
      APIService.new()
        .overrideURL(versionURL)
        .appendToUrl("expansions/")
        .get(null, null, { includeSummary: true, verbose: true })
        .then(response => {
          const data = response?.data || [];
          setExpansionsByVersion(prev => ({
            ...prev,
            [versionKey]: formatExpansions(version, data)
          }));
          setLoadingByVersion(prev => ({ ...prev, [versionKey]: false }));
        });
    },
    [expansionsByVersion, loadingByVersion]
  );

  React.useEffect(() => {
    displayVersions.forEach(version => fetchExpansions(version));
  }, [displayVersions, fetchExpansions]);

  React.useEffect(() => {
    if (!displayVersions.length) return;

    const querySelectedVersion = findVersionFromQuery(
      displayVersions,
      notificationVersion
    );
    if (
      querySelectedVersion &&
      getVersionKey(querySelectedVersion) !== expandedVersionKey
    )
      setExpandedVersionKey(getVersionKey(querySelectedVersion));
  }, [displayVersions, expandedVersionKey, notificationVersion]);

  const expandedVersion =
    find(
      displayVersions,
      version => getVersionKey(version) === expandedVersionKey
    ) || null;
  const expandedExpansions = expandedVersion
    ? expansionsByVersion[getVersionKey(expandedVersion)] || []
    : [];
  const highlightedExpansion = notificationExpansion
    ? findExpansionFromQuery(expandedExpansions, notificationExpansion)
    : null;

  React.useEffect(() => {
    if (
      highlightedExpansion?.url &&
      expansionRefs.current[highlightedExpansion.url]
    )
      expansionRefs.current[highlightedExpansion.url].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
  }, [highlightedExpansion]);

  const getDefaultExpansionLabel = version => {
    const versionExpansions = expansionsByVersion[getVersionKey(version)] || [];
    const defaultExpansion = find(
      versionExpansions,
      expansion => expansion.default || expansion.auto
    );
    if (defaultExpansion) return defaultExpansion.mnemonic;
    if (version?.expansion_url)
      return version.expansion_url
        .split("/")
        .filter(Boolean)
        .slice(-1)[0];
    if (version?.autoexpand) return t("repo.autoexpand");
    return t("common.none");
  };

  const getStaleCount = version => {
    const versionExpansions = expansionsByVersion[getVersionKey(version)] || [];
    return versionExpansions.filter(isStaleExpansion).length;
  };

  const refreshSelectedExpansions = version => {
    if (version) fetchExpansions(version, true);
  };

  const onMarkExpansionDefault = (version, expansion) => {
    APIService.new()
      .overrideURL(getVersionEndpoint(version))
      .put({ expansion_url: expansion.url })
      .then(response => {
        if (response?.status === 200) {
          const versionKey = getVersionKey(version);
          setVersionOverrides(prev => ({
            ...prev,
            [versionKey]: {
              ...(prev[versionKey] || {}),
              expansion_url: expansion.url
            }
          }));
          setExpansionsByVersion(prev => ({
            ...prev,
            [versionKey]: formatExpansions(
              { ...version, expansion_url: expansion.url },
              prev[versionKey] || []
            )
          }));
          setAlert({
            severity: "success",
            message: t("repo.default_expansion_updated")
          });
          onDataChange?.();
        } else {
          setAlert({
            severity: "error",
            message:
              response?.data?.detail ||
              response?.detail ||
              t("repo.unable_set_default_expansion")
          });
        }
      });
  };

  const onDeleteExpansionSubmit = () => {
    if (!deleteExpansion?.url) return;

    APIService.new()
      .overrideURL(deleteExpansion.url)
      .delete()
      .then(response => {
        if (!response || response?.status === 204) {
          setDeleteExpansion(false);
          setAlert({
            severity: "success",
            message: t("repo.expansion_deleted")
          });
          refreshSelectedExpansions(deleteExpansion.__version);
          onDataChange?.();
        } else {
          setAlert({
            severity: "error",
            message:
              response?.data?.detail ||
              response?.detail ||
              t("repo.unable_delete_expansion")
          });
        }
      });
  };

  const onRebuildExpansion = expansion => {
    APIService.new()
      .overrideURL(`${expansion.url}re-evaluate/`)
      .post()
      .then(response => {
        setRebuildExpansion(false);
        if (
          response?.status === 200 ||
          response?.status === 201 ||
          response?.status === 202
        ) {
          setAlert({
            severity: "success",
            message: t("repo.expansion_rebuild_accepted")
          });
          refreshSelectedExpansions(expansion.__version);
        } else {
          setAlert({
            severity: "error",
            message:
              response?.data?.detail ||
              response?.detail ||
              t("repo.unable_rebuild_expansion")
          });
        }
      });
  };

  let notificationMessage = "";
  if (highlightedExpansion) {
    notificationMessage = t("repo.opened_dependency_expansion", {
      expansion: highlightedExpansion.mnemonic,
      version: expandedVersion?.version || expandedVersion?.id
    });
  } else if (dependencyNotification && expandedVersion) {
    notificationMessage = t("repo.opened_dependency_version", {
      version: expandedVersion.version || expandedVersion.id
    });
  }

  const renderAudit = (translationKey, date, user) => {
    if (!date) return null;

    return (
      <Typography sx={{ mt: 0.5, fontSize: "12px", color: "secondary.main" }}>
        {t(translationKey)} {formatDateTime(date)} {t("common.by")}{" "}
        {getUserLabel(user) || "-"}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "calc(100vh - 300px)",
        overflow: "auto"
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
          alignItems: "center",
          mb: 2
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 700,
              color: "surface.contrastText"
            }}
          >
            {t("repo.versions")}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "secondary.main" }}>
            {t("repo.versions_expansions_subtitle")}
          </Typography>
        </Box>
        {hasAccess && (
          <MuiButton
            variant="contained"
            onClick={onCreateVersion}
            sx={{ px: 2.5, textTransform: "none" }}
          >
            {t("repo.new_version")}
          </MuiButton>
        )}
      </Box>

      {dependencyNotification && notificationMessage && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: "8px" }}>
          {notificationMessage}
        </Alert>
      )}

      <Stack spacing={1.5}>
        {headLoading && !displayVersions.length && (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {displayVersions.map(version => {
          const versionKey = getVersionKey(version);
          const expanded = versionKey === expandedVersionKey;
          const released = Boolean(version.released);
          const staleCount = getStaleCount(version);
          const canRelease = hasAccess && !isHeadVersion(version) && !released;
          const canDelete =
            hasAccess &&
            !isHeadVersion(version) &&
            !released &&
            (expansionsByVersion[versionKey] || []).length === 0;
          const versionExpansions = expansionsByVersion[versionKey] || [];
          const versionLoading = loadingByVersion[versionKey];
          let versionStatusChip;
          if (!isHeadVersion(version))
            versionStatusChip = released ? (
              <StatusChip
                label={t("common.released")}
                color="primary"
                icon={<ReleaseIcon />}
              />
            ) : (
              <StatusChip
                label={t("common.draft")}
                color="warning"
                icon={<DraftIcon />}
              />
            );

          return (
            <Paper
              key={versionKey}
              component="section"
              sx={{
                p: 1.75,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: expanded ? "primary.main" : "surface.nv80",
                backgroundColor: expanded ? "surface.n94" : "white",
                boxShadow: "none"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(260px, 2.6fr) repeat(4, minmax(72px, 0.8fr))",
                  gap: 2,
                  alignItems: "start",
                  "@media (max-width: 1024px)": {
                    gridTemplateColumns:
                      "minmax(240px, 2fr) repeat(2, minmax(72px, 1fr))"
                  },
                  "@media (max-width: 700px)": {
                    gridTemplateColumns: "1fr 1fr"
                  }
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap"
                    }}
                  >
                    <VersionIcon
                      sx={{ fontSize: "18px", color: "secondary.main" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "surface.contrastText"
                      }}
                    >
                      {version.version || version.id}
                    </Typography>
                    {versionStatusChip}
                    {staleCount > 0 && (
                      <StatusChip
                        label={t("repo.stale_count", { count: staleCount })}
                        color="error"
                        icon={<WarningIcon />}
                      />
                    )}
                  </Box>

                  <React.Fragment>
                    {version.description && (
                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: "13px",
                          color: "secondary.main"
                        }}
                      >
                        {version.description}
                      </Typography>
                    )}
                    {version.external_id && (
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: "12px",
                          color: "secondary.main"
                        }}
                      >
                        {t("common.external_id")}: {version.external_id}
                      </Typography>
                    )}
                    {renderAudit(
                      "repo.created_by_at",
                      version.created_on,
                      version.created_by
                    )}
                    {renderAudit(
                      "repo.updated_by_at",
                      version.updated_on,
                      version.updated_by
                    )}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
                    >
                      <StatusChip
                        label={t("repo.default_expansion_label", {
                          expansion: getDefaultExpansionLabel(version)
                        })}
                        variant="outlined"
                        icon={<DefaultIcon />}
                      />
                      {version.autoexpand && (
                        <StatusChip
                          label={t("repo.autoexpand")}
                          variant="outlined"
                          icon={<ExpansionIcon />}
                        />
                      )}
                    </Stack>
                  </React.Fragment>
                </Box>
                <SummaryMetric
                  label={t("search.concepts")}
                  value={get(version, "summary.active_concepts")}
                />
                <SummaryMetric
                  label={t("search.mappings")}
                  value={get(version, "summary.active_mappings")}
                />
                <SummaryMetric
                  label={t("reference.references")}
                  value={getReferencesCount(version)}
                />
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}
                >
                  <SummaryMetric
                    label={t("repo.expansions")}
                    value={versionExpansions.length}
                  />
                  {versionLoading && (
                    <CircularProgress size={16} sx={{ mt: 0.25 }} />
                  )}
                </Box>
              </Box>

              {hasAccess && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}
                >
                  {canRelease && (
                    <MuiButton
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                      onClick={() => onReleaseVersion(version)}
                    >
                      {t("common.release")}
                    </MuiButton>
                  )}
                  {canDelete && (
                    <MuiButton
                      size="small"
                      color="error"
                      variant="contained"
                      sx={{ textTransform: "none" }}
                      onClick={() => onDeleteVersion(version)}
                    >
                      {t("common.delete_label")}
                    </MuiButton>
                  )}
                </Stack>
              )}

              <MuiButton
                size="small"
                variant="text"
                sx={{
                  mt: 1.5,
                  px: 0,
                  textTransform: "none",
                  justifyContent: "flex-start"
                }}
                startIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
                onClick={() =>
                  setExpandedVersionKey(expanded ? null : versionKey)
                }
              >
                {expanded
                  ? t("repo.hide_expansions")
                  : t("repo.show_expansions", {
                      count: versionExpansions.length
                    })}
              </MuiButton>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Box sx={{ pt: 1.5 }}>
                  <Divider sx={{ mb: 1.5 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                      alignItems: "flex-start",
                      mb: 2
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "surface.contrastText"
                        }}
                      >
                        {t("repo.expansions")}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "13px", color: "secondary.main" }}
                      >
                        {t("repo.expansions_for_version", {
                          version: version.version || version.id
                        })}
                      </Typography>
                    </Box>
                    {hasAccess && (
                      <MuiButton
                        variant="contained"
                        sx={{ textTransform: "none" }}
                        onClick={() =>
                          setExpansionFormState({
                            open: true,
                            version,
                            copyFrom: null
                          })
                        }
                      >
                        {t("repo.new_expansion")}
                      </MuiButton>
                    )}
                  </Box>

                  {versionLoading && (
                    <Box
                      sx={{ py: 6, display: "flex", justifyContent: "center" }}
                    >
                      <CircularProgress size={28} />
                    </Box>
                  )}

                  {!versionLoading && versionExpansions.length === 0 && (
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: "8px",
                        border: "1px dashed",
                        borderColor: "surface.nv80",
                        boxShadow: "none",
                        textAlign: "center"
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 600, color: "surface.contrastText" }}
                      >
                        {t("repo.no_expansions_yet")}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: "13px",
                          color: "secondary.main"
                        }}
                      >
                        {t("repo.no_expansions_message")}
                      </Typography>
                      {hasAccess && (
                        <MuiButton
                          variant="outlined"
                          sx={{ mt: 1.5, textTransform: "none" }}
                          onClick={() =>
                            setExpansionFormState({
                              open: true,
                              version,
                              copyFrom: null
                            })
                          }
                        >
                          {t("repo.create_first_expansion")}
                        </MuiButton>
                      )}
                    </Paper>
                  )}

                  <Stack spacing={1.5}>
                    {!versionLoading &&
                      versionExpansions.map(expansion => {
                        const highlighted =
                          highlightedExpansion?.url === expansion.url;

                        return (
                          <Paper
                            key={expansion.url}
                            ref={element => {
                              expansionRefs.current[expansion.url] = element;
                            }}
                            sx={{
                              p: 1.5,
                              borderRadius: "8px",
                              border: "1px solid",
                              borderColor: highlighted
                                ? "warning.main"
                                : "surface.nv80",
                              backgroundColor: highlighted
                                ? "rgba(237, 108, 2, 0.06)"
                                : "white",
                              boxShadow: "none"
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 2,
                                alignItems: "flex-start",
                                flexWrap: "wrap"
                              }}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap"
                                  }}
                                >
                                  <ExpansionIcon
                                    sx={{
                                      fontSize: "18px",
                                      color: "secondary.main"
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "16px",
                                      fontWeight: 700,
                                      color: "surface.contrastText"
                                    }}
                                  >
                                    {expansion.mnemonic}
                                  </Typography>
                                  {expansion.default && (
                                    <StatusChip
                                      label={t("common.default")}
                                      color="success"
                                      icon={<DefaultIcon />}
                                    />
                                  )}
                                  {expansion.auto && !expansion.default && (
                                    <StatusChip
                                      label={t("repo.autoexpand")}
                                      variant="outlined"
                                      icon={<ExpansionIcon />}
                                    />
                                  )}
                                  {isStaleExpansion(expansion) && (
                                    <StatusChip
                                      label={t("repo.stale")}
                                      color="error"
                                      icon={<WarningIcon />}
                                    />
                                  )}
                                  {expansion.is_processing && (
                                    <StatusChip
                                      label={t("common.processing")}
                                      color="warning"
                                    />
                                  )}
                                </Box>
                                {expansion.canonical_url && (
                                  <Typography
                                    sx={{
                                      mt: 0.75,
                                      fontSize: "13px",
                                      color: "secondary.main",
                                      wordBreak: "break-all"
                                    }}
                                  >
                                    {expansion.canonical_url}
                                  </Typography>
                                )}
                                {renderAudit(
                                  "repo.last_built_by",
                                  expansion.updated_on || expansion.created_on,
                                  expansion.updated_by || expansion.created_by
                                )}
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1.5 }} />

                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ flexWrap: "wrap", rowGap: 1 }}
                            >
                              <SummaryMetric
                                label={t("search.concepts")}
                                value={expansion.active_concepts}
                              />
                              <SummaryMetric
                                label={t("search.mappings")}
                                value={expansion.active_mappings}
                              />
                              <SummaryMetric
                                label={t("reference.references")}
                                value={getReferencesCount(expansion)}
                              />
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ mt: 1.5, flexWrap: "wrap", rowGap: 1 }}
                            >
                              {!expansion.default && (
                                <MuiButton
                                  size="small"
                                  variant="outlined"
                                  sx={{ textTransform: "none" }}
                                  onClick={() =>
                                    onMarkExpansionDefault(version, expansion)
                                  }
                                >
                                  {t("repo.set_as_default")}
                                </MuiButton>
                              )}
                              <MuiButton
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: "none" }}
                                onClick={() =>
                                  setExpansionFormState({
                                    open: true,
                                    version,
                                    copyFrom: expansion
                                  })
                                }
                              >
                                {t("repo.create_similar")}
                              </MuiButton>
                              <MuiButton
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: "none" }}
                                onClick={() =>
                                  setRebuildExpansion({
                                    ...expansion,
                                    __version: version
                                  })
                                }
                                disabled={Boolean(expansion.is_processing)}
                              >
                                {t("repo.rebuild")}
                              </MuiButton>
                              <MuiButton
                                size="small"
                                variant="outlined"
                                sx={{ textTransform: "none" }}
                                startIcon={<InfoIcon />}
                                onClick={() => setDetailsExpansion(expansion)}
                              >
                                {t("common.details")}
                              </MuiButton>
                              <MuiButton
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ textTransform: "none" }}
                                onClick={() =>
                                  setDeleteExpansion({
                                    ...expansion,
                                    __version: version
                                  })
                                }
                                disabled={Boolean(expansion.default)}
                              >
                                {t("common.delete_label")}
                              </MuiButton>
                            </Stack>
                          </Paper>
                        );
                      })}
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      <ExpansionForm
        open={expansionFormState.open}
        onClose={() =>
          setExpansionFormState({
            open: false,
            version: null,
            copyFrom: null
          })
        }
        version={expansionFormState.version}
        versions={displayVersions}
        copyFrom={expansionFormState.copyFrom}
        onSubmitSuccess={() => {
          refreshSelectedExpansions(expansionFormState.version);
          onDataChange?.();
        }}
      />

      <ExpansionDetailsDialog
        expansion={detailsExpansion}
        onClose={() => setDetailsExpansion(false)}
      />

      <RebuildExpansionDialog
        expansion={rebuildExpansion}
        onClose={() => setRebuildExpansion(false)}
        onRebuild={onRebuildExpansion}
        onCreateSimilar={expansion => {
          setRebuildExpansion(false);
          setExpansionFormState({
            open: true,
            version: expansion.__version,
            copyFrom: expansion
          });
        }}
      />

      <DeleteEntityDialog
        open={deleteExpansion}
        onClose={() => setDeleteExpansion(false)}
        onSubmit={onDeleteExpansionSubmit}
        entityType={t("repo.collection_expansion")}
        entityId={deleteExpansion?.mnemonic || ""}
        relationship=""
        associationsLabel={t("repo.concepts_and_mappings")}
        warning={false}
      />
    </Box>
  );
};

export default CollectionVersionsTab;
