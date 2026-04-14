import React from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button as MuiButton,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton
} from "@mui/material";
import {
  AspectRatio as ExpansionIcon,
  CheckCircleOutline as DefaultIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  MoreVert as MoreVertIcon,
  NewReleases as ReleaseIcon,
  WarningAmberOutlined as WarningIcon
} from "@mui/icons-material";
import find from "lodash/find";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
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

const headerCellSx = {
  color: "surface.contrastText",
  fontSize: "12px",
  fontWeight: 'bold',
  borderBottom: "1px solid",
  borderColor: "surface.nv80",
  backgroundColor: "white",
  padding: '3px 16px',
  lineHeight: '1.2rem'
};

const bodyCellSx = {
  borderBottom: "1px solid",
  borderColor: "surface.nv80",
  verticalAlign: "top",
  py: 1.25
};

const compactButtonSx = {
  minWidth: 0,
  px: 0,
  textTransform: "none",
  justifyContent: "flex-start"
};

const MetaChip = ({ label, color = "default", icon, variant = "outlined" }) => (
  <Chip
    size="small"
    label={label}
    icon={icon}
    color={color}
    variant={variant}
    sx={{ height: "22px", fontWeight: 600 }}
  />
);

const CountCell = ({ value }) => (
  <Typography
    sx={{ fontSize: "16px", fontWeight: 600, color: "surface.contrastText" }}
  >
    {isNumber(value) ? value.toLocaleString() : "-"}
  </Typography>
);

const getExplicitRepoVersions = expansion => [
  ...(expansion?.explicit_source_versions || []),
  ...(expansion?.explicit_collection_versions || [])
];

const getEvaluatedRepoVersions = expansion => [
  ...(expansion?.evaluated_source_versions || []),
  ...(expansion?.evaluated_collection_versions || [])
];

const renderRepoVersionLabel = version =>
  `${version.owner} / ${version.short_code}:${version.version}`;

const CollectionVersionsTab = ({
  repo,
  versions,
  count,
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
  const [versionMenu, setVersionMenu] = React.useState({
    anchorEl: null,
    version: null
  });
  const [expansionMenu, setExpansionMenu] = React.useState({
    anchorEl: null,
    version: null,
    expansion: null
  });
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
    ) {
      setExpandedVersionKey(getVersionKey(querySelectedVersion));
    }
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
    ) {
      expansionRefs.current[highlightedExpansion.url].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [highlightedExpansion]);

  const getDefaultExpansionLabel = version => {
    const versionExpansions = expansionsByVersion[getVersionKey(version)] || [];
    const defaultExpansion = find(
      versionExpansions,
      expansion => expansion.default || expansion.auto
    );
    if (defaultExpansion) return defaultExpansion.mnemonic;
    if (version?.expansion_url) {
      return version.expansion_url
        .split("/")
        .filter(Boolean)
        .slice(-1)[0];
    }
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
      <Typography sx={{ mt: 0.25, fontSize: "12px", color: "secondary.main" }}>
        {t(translationKey)} {formatDateTime(date)} {t("common.by")}{" "}
        {getUserLabel(user) || "-"}
      </Typography>
    );
  };

  const openVersionMenu = (event, version) => {
    setVersionMenu({ anchorEl: event.currentTarget, version });
  };

  const closeVersionMenu = () => {
    setVersionMenu({ anchorEl: null, version: null });
  };

  const openExpansionMenu = (event, version, expansion) => {
    setExpansionMenu({ anchorEl: event.currentTarget, version, expansion });
  };

  const closeExpansionMenu = () => {
    setExpansionMenu({ anchorEl: null, version: null, expansion: null });
  };

  const renderVersionRow = version => {
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

    return (
      <React.Fragment key={versionKey}>
        <TableRow hover>
          <TableCell sx={{ ...bodyCellSx, width: "52%" }}>
            <Box sx={{ position: "relative", pl: 5 }}>
              <IconButton
                size="small"
                sx={{ position: "absolute", left: 0, top: -4 }}
                onClick={() =>
                  setExpandedVersionKey(expanded ? null : versionKey)
                }
              >
                {expanded ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", rowGap: 0.75 }}
                >
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "surface.contrastText"
                    }}
                  >
                    {version.version || version.id}
                  </Typography>
                  {isHeadVersion(version) && <MetaChip label="HEAD" />}
                  {!isHeadVersion(version) && released && (
                    <MetaChip
                      label={t("common.released")}
                      color="primary"
                      icon={<ReleaseIcon />}
                    />
                  )}
                  {!isHeadVersion(version) && !released && (
                    <MetaChip
                      label={t("common.draft")}
                      color="warning"
                      icon={<DraftIcon />}
                    />
                  )}
                  {staleCount > 0 && (
                    <MetaChip
                      label={t("repo.stale_count", { count: staleCount })}
                      color="error"
                      icon={<WarningIcon />}
                    />
                  )}
                  <MetaChip
                    label={t("repo.default_expansion_label", {
                      expansion: getDefaultExpansionLabel(version)
                    })}
                    icon={<DefaultIcon />}
                  />
                  {version.autoexpand && (
                    <MetaChip
                      label={t("repo.autoexpand")}
                      icon={<ExpansionIcon />}
                    />
                  )}
                </Stack>

                {version.description && (
                  <Typography
                    sx={{ mt: 0.75, fontSize: "13px", color: "secondary.main" }}
                  >
                    {version.description}
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
              </Box>
            </Box>
          </TableCell>
          <TableCell sx={{ ...bodyCellSx, width: "16%" }}>
            <CountCell value={get(version, "summary.active_concepts")} />
          </TableCell>
          <TableCell sx={{ ...bodyCellSx, width: "16%" }}>
            <CountCell value={get(version, "summary.active_mappings")} />
          </TableCell>
          <TableCell sx={{ ...bodyCellSx, width: "16%" }}>
            {versionLoading ? (
              <CircularProgress size={18} />
            ) : (
              <CountCell value={getReferencesCount(version)} />
            )}
          </TableCell>
          <TableCell sx={{ ...bodyCellSx, width: "1%", whiteSpace: "nowrap" }}>
            {hasAccess && (
              <IconButton
                size="small"
                onClick={event => openVersionMenu(event, version)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              p: 0,
              borderBottom: expanded ? "1px solid" : 0,
              borderColor: "surface.nv80"
            }}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ px: 2, py: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx}>
                        {t("repo.expansions")}
                      </TableCell>
                      <TableCell sx={headerCellSx}>
                        {t("search.concepts")}
                      </TableCell>
                      <TableCell sx={headerCellSx}>
                        {t("search.mappings")}
                      </TableCell>
                      <TableCell sx={headerCellSx}>
                        {t("repo.resolved_repo_versions")}
                      </TableCell>
                      <TableCell sx={headerCellSx} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {versionLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ ...bodyCellSx, textAlign: "center", py: 3 }}
                        >
                          <CircularProgress size={22} />
                        </TableCell>
                      </TableRow>
                    )}
                    {!versionLoading && versionExpansions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ ...bodyCellSx, py: 2 }}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              sx={{ fontSize: "13px", color: "secondary.main" }}
                            >
                              {t("repo.no_expansions_message")}
                            </Typography>
                            {hasAccess && (
                              <MuiButton
                                size="small"
                                variant="text"
                                sx={compactButtonSx}
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
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {!versionLoading &&
                      versionExpansions.map(expansion => {
                        const highlighted =
                          highlightedExpansion?.url === expansion.url;
                        const explicitRepoVersions = getExplicitRepoVersions(
                          expansion
                        );
                        const evaluatedRepoVersions = getEvaluatedRepoVersions(
                          expansion
                        );
                        return (
                          <TableRow
                            key={expansion.url}
                            ref={element => {
                              expansionRefs.current[expansion.url] = element;
                            }}
                            sx={{
                              backgroundColor: highlighted
                                ? "rgba(237, 108, 2, 0.06)"
                                : "transparent"
                            }}
                          >
                            <TableCell sx={bodyCellSx}>
                              <Box sx={{ minWidth: 0, pl: 5 }}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ flexWrap: "wrap", rowGap: 0.75 }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: "14px",
                                      fontWeight: 700,
                                      color: "primary.main",
                                      cursor: "pointer"
                                    }}
                                    onClick={() =>
                                      setDetailsExpansion(expansion)
                                    }
                                  >
                                    {expansion.mnemonic}
                                  </Typography>
                                  {expansion.default && (
                                    <MetaChip
                                      label={t("common.default")}
                                      color="success"
                                      icon={<DefaultIcon />}
                                    />
                                  )}
                                  {expansion.auto && !expansion.default && (
                                    <MetaChip
                                      label={t("repo.autoexpand")}
                                      icon={<ExpansionIcon />}
                                    />
                                  )}
                                  {isStaleExpansion(expansion) && (
                                    <MetaChip
                                      label={t("repo.stale")}
                                      color="error"
                                      icon={<WarningIcon />}
                                    />
                                  )}
                                </Stack>
                                {expansion.canonical_url && (
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: "12px",
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
                            </TableCell>
                            <TableCell sx={bodyCellSx}>
                              <CountCell value={expansion.active_concepts} />
                            </TableCell>
                            <TableCell sx={bodyCellSx}>
                              <CountCell value={expansion.active_mappings} />
                            </TableCell>
                            <TableCell sx={bodyCellSx}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "secondary.main"
                                  }}
                                >
                                  {t("repo.explicit_repo_versions")}
                                </Typography>
                                {explicitRepoVersions.length ? (
                                  <Box sx={{ mt: 0.25 }}>
                                    {explicitRepoVersions.map(repoVersion => (
                                      <Typography
                                        key={
                                          repoVersion.version_url ||
                                          `${repoVersion.owner}-${repoVersion.short_code}-${repoVersion.version}`
                                        }
                                        sx={{
                                          fontSize: "12px",
                                          color: "primary.main",
                                          lineHeight: 1.45,
                                          wordBreak: "break-word"
                                        }}
                                      >
                                        {renderRepoVersionLabel(repoVersion)}
                                      </Typography>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography
                                    sx={{
                                      mt: 0.25,
                                      fontSize: "12px",
                                      color: "secondary.main"
                                    }}
                                  >
                                    {t("common.none")}
                                  </Typography>
                                )}

                                <Typography
                                  sx={{
                                    mt: 1,
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "secondary.main"
                                  }}
                                >
                                  {t("repo.evaluated_repo_versions")}
                                </Typography>
                                {evaluatedRepoVersions.length ? (
                                  <Box sx={{ mt: 0.25 }}>
                                    {evaluatedRepoVersions.map(repoVersion => (
                                      <Typography
                                        key={
                                          repoVersion.version_url ||
                                          `${repoVersion.owner}-${repoVersion.short_code}-${repoVersion.version}-evaluated`
                                        }
                                        sx={{
                                          fontSize: "12px",
                                          color: "primary.main",
                                          lineHeight: 1.45,
                                          wordBreak: "break-word"
                                        }}
                                      >
                                        {renderRepoVersionLabel(repoVersion)}
                                      </Typography>
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography
                                    sx={{
                                      mt: 0.25,
                                      fontSize: "12px",
                                      color: "secondary.main"
                                    }}
                                  >
                                    {t("common.none")}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                ...bodyCellSx,
                                width: "1%",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {hasAccess && (
                                <IconButton
                                  size="small"
                                  onClick={event =>
                                    openExpansionMenu(event, version, expansion)
                                  }
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  return (
    <Box sx={{height: "calc(100vh - 300px)", overflow: "auto", display: 'flex', flexDirection: 'column' }}>
      <Paper
        sx={{
          boxShadow: "none",
          overflow: "hidden",
          height: '48px',
          borderBottom: '1px solid',
          borderColor: 'surface.nv80',
          borderRadius: 0,
          fontSize: '14px',
          padding: '12px 12px 12px 24px',
          color: 'rgba(0, 0, 0, 0.87)'
        }}
      >
        {count !== false ? `${count} versions` : <Skeleton variant='text' />}
    </Paper>

      <Paper
        sx={{
          boxShadow: "none",
          overflow: "hidden"
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{...headerCellSx, paddingLeft: '54px'}}>{t("common.id")}</TableCell>
                <TableCell sx={headerCellSx}>{t("search.concepts")}</TableCell>
                <TableCell sx={headerCellSx}>{t("search.mappings")}</TableCell>
                <TableCell sx={headerCellSx}>
                  {t("reference.references")}
                </TableCell>
                <TableCell sx={headerCellSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {headLoading && !displayVersions.length && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{ ...bodyCellSx, textAlign: "center", py: 4 }}
                  >
                    <CircularProgress size={26} />
                  </TableCell>
                </TableRow>
              )}
              {displayVersions.map(renderVersionRow)}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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

      <Menu
        anchorEl={versionMenu.anchorEl}
        open={Boolean(versionMenu.anchorEl)}
        onClose={closeVersionMenu}
      >
        <MenuItem
          onClick={() => {
            const version = versionMenu.version;
            closeVersionMenu();
            if (version) {
              setExpansionFormState({ open: true, version, copyFrom: null });
            }
          }}
        >
          {t("repo.new_expansion")}
        </MenuItem>
        {Boolean(
          versionMenu.version &&
            hasAccess &&
            !isHeadVersion(versionMenu.version) &&
            !versionMenu.version.released
        ) && (
          <MenuItem
            onClick={() => {
              const version = versionMenu.version;
              closeVersionMenu();
              if (version) onReleaseVersion(version);
            }}
          >
            {t("common.release")}
          </MenuItem>
        )}
        {Boolean(
          versionMenu.version &&
            hasAccess &&
            !isHeadVersion(versionMenu.version) &&
            !versionMenu.version.released &&
            (expansionsByVersion[getVersionKey(versionMenu.version)] || [])
              .length === 0
        ) && (
          <MenuItem
            onClick={() => {
              const version = versionMenu.version;
              closeVersionMenu();
              if (version) onDeleteVersion(version);
            }}
            sx={{ color: "error.main" }}
          >
            {t("common.delete_label")}
          </MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={expansionMenu.anchorEl}
        open={Boolean(expansionMenu.anchorEl)}
        onClose={closeExpansionMenu}
      >
        {Boolean(
          expansionMenu.expansion && !expansionMenu.expansion.default
        ) && (
          <MenuItem
            onClick={() => {
              const { version, expansion } = expansionMenu;
              closeExpansionMenu();
              if (version && expansion)
                onMarkExpansionDefault(version, expansion);
            }}
          >
            {t("repo.set_as_default")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            const { version, expansion } = expansionMenu;
            closeExpansionMenu();
            if (version && expansion) {
              setExpansionFormState({
                open: true,
                version,
                copyFrom: expansion
              });
            }
          }}
        >
          {t("repo.create_similar")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const { version, expansion } = expansionMenu;
            closeExpansionMenu();
            if (version && expansion) {
              setRebuildExpansion({ ...expansion, __version: version });
            }
          }}
        >
          {t("repo.rebuild")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const expansion = expansionMenu.expansion;
            closeExpansionMenu();
            if (expansion) setDetailsExpansion(expansion);
          }}
        >
          {t("common.details")}
        </MenuItem>
        <MenuItem
          disabled={Boolean(expansionMenu.expansion?.default)}
          onClick={() => {
            const { version, expansion } = expansionMenu;
            closeExpansionMenu();
            if (version && expansion) {
              setDeleteExpansion({ ...expansion, __version: version });
            }
          }}
          sx={{ color: "error.main" }}
        >
          {t("common.delete_label")}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CollectionVersionsTab;
