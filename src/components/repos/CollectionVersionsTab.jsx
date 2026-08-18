import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button as MuiButton,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  AspectRatio as ExpansionIcon,
  CheckCircleOutlined as DefaultIcon,
  ContentCopy as CopyIcon,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  MoreVert as MoreVertIcon,
  NewReleases as ReleaseIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as VisibilityIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import find from 'lodash/find';
import get from 'lodash/get';

import APIService from '../../services/APIService';
import {
  copyToClipboard,
  currentUserHasAccess,
  dropVersion,
  formatDate,
  headFirst,
  toFullAPIURL
} from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';
import DeleteEntityDialog from '../common/DeleteEntityDialog';
import ConceptIcon from '../concepts/ConceptIcon';
import MappingIcon from '../mappings/MappingIcon';
import ExpansionForm from './ExpansionForm';
import ExpansionDetailsDialog from './ExpansionDetailsDialog';
import ExpansionRowList from './ExpansionRowList';
import RebuildExpansionDialog from './RebuildExpansionDialog';
import RepoVersionRowMenu from './RepoVersionRowMenu';
import VersionStatusIndicator from './VersionStatusIndicator';
import {
  REPO_VERSIONS_PAGE_SIZE,
  bodyCellSx,
  formatCount,
  getPreviousVersionURL,
  getVersionKey,
  getVersionLabel,
  headerCellSx,
  isHeadVersion
} from './versionsTab.styles';

const PROCESSING_POLL_INTERVAL_MS = 10000;
const PROCESSED_CHIP_FADE_MS = 6000;

const isStaleExpansion = expansion =>
  Boolean(
    expansion?.is_stale ||
      expansion?.stale ||
      expansion?.extras?.__stale_expansion ||
      expansion?.extras?.stale
  );

const isExpansionProcessing = expansion => Boolean(expansion?.is_processing);

const getVersionEndpoint = version => {
  const versionURL = version?.version_url || version?.url || '';
  return version?.version === 'HEAD' ? `${dropVersion(versionURL)}HEAD/` : versionURL;
};

const matchesByValue = (value, candidates = []) => {
  if (!value) return false;
  const expected = value.toLowerCase();
  return candidates.filter(Boolean).some(candidate => String(candidate).toLowerCase() === expected);
};

const findVersionFromQuery = (versions, value) =>
  find(versions, version => matchesByValue(value, [version?.version, version?.id, version?.url, version?.version_url]));

const findExpansionFromQuery = (expansions, value) =>
  find(expansions, expansion => matchesByValue(value, [expansion?.mnemonic, expansion?.id, expansion?.url]));

const formatExpansions = (version, versionExpansions = []) => {
  let expansions = [...versionExpansions]
    .sort((a, b) => new Date(b.created_on) - new Date(a.created_on))
    .map(expansion => ({ ...expansion, default: false, auto: false }));

  if (version?.autoexpand && expansions.length > 0) {
    const [latestExpansion, ...rest] = expansions;
    expansions = [{ ...latestExpansion, auto: true }, ...rest];
  }

  if (version?.expansion_url) {
    const defaultExpansion = find(expansions, { url: version.expansion_url });
    if (defaultExpansion) {
      expansions = [
        { ...defaultExpansion, default: true },
        ...expansions.filter(expansion => expansion.url !== version.expansion_url)
      ];
    }
  }

  return expansions;
};

const parseProcessingValue = value => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

const CollectionVersionsTab = ({
  repo,
  loading,
  refreshKey,
  onVersionChange,
  onEditVersion,
  onReleaseVersion,
  onDeleteVersion,
  onDataChange
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const { setAlert } = React.useContext(OperationsContext);
  const hasAccess = currentUserHasAccess();
  const baseRepoURL = dropVersion(repo?.version_url || repo?.url || '');

  const [headVersion, setHeadVersion] = React.useState(isHeadVersion(repo) ? repo : null);
  const [versions, setVersions] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(REPO_VERSIONS_PAGE_SIZE);
  const [isLoadingVersions, setIsLoadingVersions] = React.useState(true);

  const [expansionsByVersion, setExpansionsByVersion] = React.useState({});
  const [loadingByVersion, setLoadingByVersion] = React.useState({});
  const [versionOverrides, setVersionOverrides] = React.useState({});
  const [repoUpdatesByExpansion, setRepoUpdatesByExpansion] = React.useState({});
  const [processingStatusByExpansion, setProcessingStatusByExpansion] = React.useState({});

  const [expansionFormState, setExpansionFormState] = React.useState({ open: false, version: null, copyFrom: null });
  const [deleteExpansion, setDeleteExpansion] = React.useState(null);
  const [detailsExpansion, setDetailsExpansion] = React.useState(null);
  const [rebuildExpansion, setRebuildExpansion] = React.useState(null);
  const [expandedVersionKeys, setExpandedVersionKeys] = React.useState(new Set());
  const [rowMenu, setRowMenu] = React.useState({ anchorEl: null, version: null });
  const [expansionMenu, setExpansionMenu] = React.useState({ anchorEl: null, version: null, expansion: null });

  const fetchedRepoUpdatesRef = React.useRef(new Set());
  const processingStatusRef = React.useRef({});
  const processingPollsRef = React.useRef({});
  const processedCleanupRef = React.useRef({});
  const handledDeepLinkRef = React.useRef(false);

  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const notificationVersion = searchParams.get('version_url') || searchParams.get('version') || searchParams.get('version_id');
  const notificationExpansion = searchParams.get('expansion_url') || searchParams.get('expansion') || searchParams.get('expansion_id');

  const fetchVersionsPage = (nextPage, nextPageSize) => {
    if (!baseRepoURL) return;
    setIsLoadingVersions(true);
    APIService.new()
      .overrideURL(baseRepoURL)
      .appendToUrl('versions/')
      .get(null, null, { verbose: true, includeSummary: true, limit: nextPageSize, page: nextPage })
      .then(response => {
        const _versions = Array.isArray(response?.data) ? response.data : [];
        setVersions(_versions);
        setTotalCount(parseInt(response?.headers?.['num_found'] || _versions.length || 0));
      })
      .finally(() => setIsLoadingVersions(false));
  };

  React.useEffect(() => {
    setPage(1);
    fetchVersionsPage(1, pageSize);
  }, [baseRepoURL, refreshKey]);

  React.useEffect(() => {
    if (!baseRepoURL) {
      setHeadVersion(null);
      return;
    }
    if (isHeadVersion(repo)) {
      setHeadVersion(repo);
      return;
    }
    APIService.new()
      .overrideURL(baseRepoURL)
      .get(null, null, { includeSummary: true }, true)
      .then(response => {
        setHeadVersion(response?.data || response?.response?.data || null);
      });
  }, [baseRepoURL, repo]);

  const displayVersions = React.useMemo(() => {
    const normalizedHeadVersion = headVersion ? {
      ...headVersion,
      id: 'HEAD',
      version: 'HEAD',
      version_url: headVersion.url || headVersion.version_url || baseRepoURL
    } : null;
    const versionList = Array.isArray(versions) ? versions : [];
    const pagedVersions = page === 1
      ? [normalizedHeadVersion, ...versionList].filter(Boolean)
      : versionList.filter(version => !isHeadVersion(version));
    const withOverrides = pagedVersions.map(version => ({
      ...version,
      ...(versionOverrides[getVersionKey(version)] || {})
    }));
    return headFirst(withOverrides);
  }, [baseRepoURL, headVersion, page, versionOverrides, versions]);

  const fetchExpansions = React.useCallback((version, force = false) => {
    const versionKey = getVersionKey(version);
    if (!versionKey || loadingByVersion[versionKey] || (!force && expansionsByVersion[versionKey])) return;

    const versionURL = getVersionEndpoint(version);
    if (!versionURL) return;

    setLoadingByVersion(prev => ({ ...prev, [versionKey]: true }));
    APIService.new()
      .overrideURL(versionURL)
      .appendToUrl('expansions/')
      .get(null, null, { includeSummary: true, verbose: true })
      .then(response => {
        const data = response?.data || [];
        setExpansionsByVersion(prev => ({ ...prev, [versionKey]: formatExpansions(version, data) }));
        setLoadingByVersion(prev => ({ ...prev, [versionKey]: false }));
      });
  }, [expansionsByVersion, loadingByVersion]);

  React.useEffect(() => {
    displayVersions.forEach(version => fetchExpansions(version));
  }, [displayVersions, fetchExpansions]);

  const getDefaultExpansion = React.useCallback(version => {
    const versionExpansions = expansionsByVersion[getVersionKey(version)] || [];
    return find(versionExpansions, exp => exp.default || exp.auto) || versionExpansions[0] || null;
  }, [expansionsByVersion]);

  const getDefaultExpansionLabel = version => {
    const defaultExpansion = getDefaultExpansion(version);
    if (defaultExpansion) return defaultExpansion.mnemonic;
    if (version?.expansion_url) return version.expansion_url.split('/').filter(Boolean).slice(-1)[0];
    if (version?.autoexpand) return t('repo.autoexpand');
    return t('common.none');
  };

  const fetchResolvedRepoUpdates = React.useCallback((version, expansion) => {
    if (!hasAccess || !expansion?.url || !expansion?.mnemonic) return;
    if (fetchedRepoUpdatesRef.current.has(expansion.url)) return;
    fetchedRepoUpdatesRef.current.add(expansion.url);

    const versionURL = getVersionEndpoint(version);
    APIService.new()
      .overrideURL(`${versionURL}expansions/${expansion.mnemonic}/resolved-repo-updates/`)
      .get()
      .then(response => {
        const data = response?.data || {};
        setRepoUpdatesByExpansion(prev => ({ ...prev, [expansion.url]: data }));
      });
  }, [hasAccess]);

  // Only fetch resolved-repo-updates for each visible row's default expansion,
  // not every expansion of every version.
  React.useEffect(() => {
    displayVersions.forEach(version => {
      const defaultExpansion = getDefaultExpansion(version);
      if (defaultExpansion) fetchResolvedRepoUpdates(version, defaultExpansion);
    });
  }, [displayVersions, expansionsByVersion, fetchResolvedRepoUpdates, getDefaultExpansion]);

  // Auto-expand any row whose default expansion has something worth flagging
  // (resolved repo updates available, or stale) so the warning isn't hidden a click away.
  React.useEffect(() => {
    const toExpand = [];
    displayVersions.forEach(version => {
      const defaultExpansion = getDefaultExpansion(version);
      if (!defaultExpansion) return;
      const updates = repoUpdatesByExpansion[defaultExpansion.url];
      const hasUpdates = hasAccess && updates && Object.keys(updates).length > 0;
      if (hasUpdates || isStaleExpansion(defaultExpansion)) toExpand.push(getVersionKey(version));
    });
    if (!toExpand.length) return;
    setExpandedVersionKeys(prev => {
      const next = new Set([...prev, ...toExpand]);
      return next.size === prev.size ? prev : next;
    });
  }, [displayVersions, getDefaultExpansion, hasAccess, repoUpdatesByExpansion]);

  // When a version's row is expanded, fetch resolved-repo-updates for every one of
  // its expansions (not just the default) so the inline list can show full detail.
  React.useEffect(() => {
    expandedVersionKeys.forEach(versionKey => {
      const version = find(displayVersions, item => getVersionKey(item) === versionKey);
      if (!version) return;
      (expansionsByVersion[versionKey] || []).forEach(expansion => fetchResolvedRepoUpdates(version, expansion));
    });
  }, [expandedVersionKeys, expansionsByVersion, displayVersions, fetchResolvedRepoUpdates]);

  React.useEffect(() => {
    if (handledDeepLinkRef.current) return;
    if (!displayVersions.length || !notificationVersion) return;
    const version = findVersionFromQuery(displayVersions, notificationVersion);
    if (!version) return;
    const versionExpansions = expansionsByVersion[getVersionKey(version)];
    if (!versionExpansions) return;

    handledDeepLinkRef.current = true;
    if (notificationExpansion) {
      const expansion = findExpansionFromQuery(versionExpansions, notificationExpansion);
      if (expansion) {
        setDetailsExpansion(expansion);
        return;
      }
    }
    if (versionExpansions.length) {
      setExpandedVersionKeys(prev => new Set([...prev, getVersionKey(version)]));
    }
  }, [displayVersions, expansionsByVersion, notificationExpansion, notificationVersion]);

  React.useEffect(() => {
    processingStatusRef.current = processingStatusByExpansion;
  }, [processingStatusByExpansion]);

  const clearProcessingPoll = React.useCallback(url => {
    if (!processingPollsRef.current[url]) return;
    window.clearInterval(processingPollsRef.current[url]);
    delete processingPollsRef.current[url];
  }, []);

  const clearProcessedCleanup = React.useCallback(url => {
    if (!processedCleanupRef.current[url]) return;
    window.clearTimeout(processedCleanupRef.current[url]);
    delete processedCleanupRef.current[url];
  }, []);

  const markExpansionProcessing = React.useCallback(url => {
    if (!url) return;
    clearProcessedCleanup(url);
    setProcessingStatusByExpansion(prev => {
      if (prev[url]?.state === 'processing') return prev;
      return { ...prev, [url]: { state: 'processing' } };
    });
  }, [clearProcessedCleanup]);

  const markExpansionProcessed = React.useCallback((url, onlyIfTracked = false) => {
    if (!url) return;
    const currentState = processingStatusRef.current[url]?.state;
    if (onlyIfTracked && currentState !== 'processing') {
      clearProcessingPoll(url);
      return;
    }
    clearProcessingPoll(url);
    clearProcessedCleanup(url);
    setProcessingStatusByExpansion(prev => ({ ...prev, [url]: { state: 'processed', processedAt: Date.now() } }));
    processedCleanupRef.current[url] = window.setTimeout(() => {
      setProcessingStatusByExpansion(prev => {
        if (!prev[url]) return prev;
        const next = { ...prev };
        delete next[url];
        return next;
      });
      delete processedCleanupRef.current[url];
    }, PROCESSED_CHIP_FADE_MS);
  }, [clearProcessedCleanup, clearProcessingPoll]);

  React.useEffect(() => () => {
    Object.keys(processingPollsRef.current).forEach(clearProcessingPoll);
    Object.keys(processedCleanupRef.current).forEach(clearProcessedCleanup);
  }, [clearProcessedCleanup, clearProcessingPoll]);

  const refreshSelectedExpansions = React.useCallback(version => {
    if (version) fetchExpansions(version, true);
  }, [fetchExpansions]);

  const pollExpansionProcessing = React.useCallback((version, expansion) => {
    if (!expansion?.url) return;
    APIService.new().overrideURL(expansion.url + 'processing/').get(null, null, null, true).then(response => {
      if (response?.status !== 200) return;
      const isProcessing = parseProcessingValue(response?.data);
      if (isProcessing) {
        markExpansionProcessing(expansion.url);
        return;
      }
      markExpansionProcessed(expansion.url, true);
      refreshSelectedExpansions(version);
    });
  }, [markExpansionProcessed, markExpansionProcessing, refreshSelectedExpansions]);

  const ensureProcessingPoll = React.useCallback((version, expansion) => {
    if (!expansion?.url || processingPollsRef.current[expansion.url]) return;
    processingPollsRef.current[expansion.url] = window.setInterval(() => {
      pollExpansionProcessing(version, expansion);
    }, PROCESSING_POLL_INTERVAL_MS);
  }, [pollExpansionProcessing]);

  React.useEffect(() => {
    const activeProcessingUrls = new Set();
    Object.entries(expansionsByVersion).forEach(([versionKey, versionExpansions]) => {
      const version = find(displayVersions, item => getVersionKey(item) === versionKey);
      if (!version) return;
      versionExpansions.forEach(expansion => {
        if (!expansion?.url) return;
        if (isExpansionProcessing(expansion)) {
          activeProcessingUrls.add(expansion.url);
          markExpansionProcessing(expansion.url);
          ensureProcessingPoll(version, expansion);
          return;
        }
        clearProcessingPoll(expansion.url);
        markExpansionProcessed(expansion.url, true);
      });
    });
    Object.keys(processingPollsRef.current).forEach(url => {
      if (!activeProcessingUrls.has(url)) clearProcessingPoll(url);
    });
  }, [clearProcessingPoll, displayVersions, ensureProcessingPoll, expansionsByVersion, markExpansionProcessed, markExpansionProcessing]);

  const onMarkExpansionDefault = (version, expansion) => {
    APIService.new().overrideURL(getVersionEndpoint(version)).put({ expansion_url: expansion.url }).then(response => {
      if (response?.status === 200) {
        const versionKey = getVersionKey(version);
        setVersionOverrides(prev => ({ ...prev, [versionKey]: { ...(prev[versionKey] || {}), expansion_url: expansion.url } }));
        setExpansionsByVersion(prev => ({ ...prev, [versionKey]: formatExpansions({ ...version, expansion_url: expansion.url }, prev[versionKey] || []) }));
        setAlert({ severity: 'success', message: t('repo.default_expansion_updated') });
        onDataChange?.();
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || response?.detail || t('repo.unable_set_default_expansion') });
      }
    });
  };

  const onDeleteExpansionSubmit = () => {
    if (!deleteExpansion?.url) return;
    APIService.new().overrideURL(deleteExpansion.url).delete().then(response => {
      if (!response || response?.status === 204) {
        setDeleteExpansion(false);
        setAlert({ severity: 'success', message: t('repo.expansion_deleted') });
        refreshSelectedExpansions(deleteExpansion.__version);
        onDataChange?.();
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || response?.detail || t('repo.unable_delete_expansion') });
      }
    });
  };

  const onRebuildExpansion = expansion => {
    APIService.new().overrideURL(`${expansion.url}re-evaluate/`).post().then(response => {
      setRebuildExpansion(false);
      if ([200, 201, 202].includes(response?.status)) {
        setAlert({ severity: 'success', message: t('repo.expansion_rebuild_accepted') });
        refreshSelectedExpansions(expansion.__version);
      } else {
        setAlert({ severity: 'error', message: response?.data?.detail || response?.detail || t('repo.unable_rebuild_expansion') });
      }
    });
  };

  const compareVersion = version => {
    const previousVersionURL = getPreviousVersionURL(version);
    if (previousVersionURL) {
      history.push(`${baseRepoURL}compare-versions?version1=${previousVersionURL}&version2=${version.version_url || version.url}`);
    }
  };

  const copyVersionURL = version => {
    copyToClipboard(toFullAPIURL(version.version_url || version.url));
    setAlert({ severity: 'success', message: t('repo.copied_version_url') });
  };

  const toggleVersionExpand = version => {
    const versionKey = getVersionKey(version);
    setExpandedVersionKeys(prev => {
      const next = new Set(prev);
      if (next.has(versionKey)) next.delete(versionKey);
      else next.add(versionKey);
      return next;
    });
  };

  const openRowMenu = (event, version) => setRowMenu({ anchorEl: event.currentTarget, version });
  const closeRowMenu = () => setRowMenu({ anchorEl: null, version: null });
  const openExpansionMenu = (event, version, expansion) => setExpansionMenu({ anchorEl: event.currentTarget, version, expansion });
  const closeExpansionMenu = () => setExpansionMenu({ anchorEl: null, version: null, expansion: null });

  const buildRowMenuItems = version => {
    const versionKey = getVersionKey(version);
    const isHead = isHeadVersion(version);
    const released = Boolean(version.released);
    const versionExpansions = expansionsByVersion[versionKey] || [];
    const canDeleteVersion = !isHead && !released && versionExpansions.length === 0;

    const items = [
      { key: 'explore', label: t('repo.explore_version'), icon: <VisibilityIcon />, onClick: () => onVersionChange?.(version) },
      { key: 'copy', label: t('common.copy_api_url'), icon: <CopyIcon />, onClick: () => copyVersionURL(version) },
      { key: 'compare', label: t('repo.compare_with_previous'), icon: <OpenInNewIcon />, disabled: !getPreviousVersionURL(version), onClick: () => compareVersion(version) },
      { divider: true },
      { key: 'new-expansion', label: t('repo.new_expansion'), icon: <AddIcon />, onClick: () => setExpansionFormState({ open: true, version, copyFrom: null }) },
      { key: 'manage-expansions', label: t('repo.expansions'), icon: <ExpansionIcon />, disabled: !versionExpansions.length, onClick: () => toggleVersionExpand(version) }
    ];

    if (hasAccess) {
      items.push(
        { divider: true },
        { key: 'edit', label: t('common.edit'), icon: <EditIcon />, disabled: isHead, onClick: () => onEditVersion?.(version) },
        { key: 'release', label: released ? t('repo.unrelease_version') : t('repo.release_version'), icon: <ReleaseIcon />, disabled: isHead, onClick: () => onReleaseVersion?.(version) },
        { key: 'delete', label: t('repo.delete_repo_version'), icon: <DeleteIcon />, disabled: !canDeleteVersion, danger: true, onClick: () => onDeleteVersion?.(version) }
      );
    }

    return items;
  };

  const buildExpansionMenuItems = () => {
    const { version, expansion } = expansionMenu;
    if (!version || !expansion) return [];

    const items = [];
    if (!expansion.default) {
      items.push({ key: 'set-default', label: t('repo.set_as_default'), onClick: () => onMarkExpansionDefault(version, expansion) });
    }
    items.push(
      { key: 'create-similar', label: t('repo.create_similar'), onClick: () => setExpansionFormState({ open: true, version, copyFrom: expansion }) },
      { key: 'rebuild', label: t('repo.rebuild'), onClick: () => setRebuildExpansion({ ...expansion, __version: version }) },
      { key: 'details', label: t('common.details'), onClick: () => setDetailsExpansion(expansion) },
      { key: 'delete', label: t('common.delete_label'), danger: true, disabled: Boolean(expansion.default), onClick: () => setDeleteExpansion({ ...expansion, __version: version }) }
    );
    return items;
  };

  const renderVersionRow = version => {
    const versionKey = getVersionKey(version);
    const isHead = isHeadVersion(version);
    const released = Boolean(version.released);
    const versionExpansions = expansionsByVersion[versionKey] || [];
    const versionLoading = loadingByVersion[versionKey];
    const defaultExpansion = getDefaultExpansion(version);
    const conceptCount = get(defaultExpansion, 'summary.active_concepts') ?? get(version, 'summary.active_concepts');
    const mappingCount = get(defaultExpansion, 'summary.active_mappings') ?? get(version, 'summary.active_mappings');
    const expansionUpdates = defaultExpansion ? repoUpdatesByExpansion[defaultExpansion.url] : null;
    const hasRepoUpdates = hasAccess && expansionUpdates && Object.keys(expansionUpdates).length > 0;
    const stale = isStaleExpansion(defaultExpansion);
    const showWarning = hasRepoUpdates || stale;
    const expanded = expandedVersionKeys.has(versionKey);

    return (
      <React.Fragment key={versionKey}>
        <TableRow hover>
          <TableCell sx={bodyCellSx}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
              <MuiButton
                size="small"
                onClick={() => onVersionChange?.(version)}
                sx={{ minWidth: 0, p: 0, textTransform: 'none', fontWeight: 700 }}
              >
                {getVersionLabel(version)}
              </MuiButton>
              <Chip
                size="small"
                variant="outlined"
                icon={<DefaultIcon sx={{ fontSize: '14px !important' }} />}
                label={t('repo.default_expansion_label', { expansion: getDefaultExpansionLabel(version) })}
                sx={{ height: '22px', fontWeight: 600 }}
              />
            </Stack>
            {version.description && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                {version.description}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
              {version.created_on ? formatDate(version.created_on) : ''}{version.created_by ? ` · ${version.created_by}` : ''}
            </Typography>
          </TableCell>
          <TableCell sx={bodyCellSx}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <ConceptIcon selected color="secondary" sx={{ width: 12, height: 12 }} />
                <Typography variant="body2">{formatCount(conceptCount)}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <MappingIcon width="15px" height="13px" fill="secondary.main" color="secondary" />
                <Typography variant="body2">{formatCount(mappingCount)}</Typography>
              </Stack>
              {versionLoading && <CircularProgress size={14} />}
              {!versionLoading && versionExpansions.length > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  icon={expanded ? <CollapseIcon sx={{ fontSize: '16px !important' }} /> : <ExpandIcon sx={{ fontSize: '16px !important' }} />}
                  label={versionExpansions.length > 1 ? t('repo.show_expansions', { count: versionExpansions.length }) : t('repo.expansions')}
                  onClick={() => toggleVersionExpand(version)}
                  sx={{ height: '24px', cursor: 'pointer', fontWeight: 600 }}
                />
              )}
            </Stack>
          </TableCell>
          <TableCell sx={bodyCellSx}>
            <VersionStatusIndicator isHead={isHead} released={released} retired={version.retired} />
          </TableCell>
          <TableCell sx={{ ...bodyCellSx, width: '1%' }}>
            {showWarning && (
              <Tooltip title={hasRepoUpdates ? t('repo.resolved_repo_updates_available') : t('repo.stale')}>
                <IconButton
                  size="small"
                  onClick={() => defaultExpansion && setRebuildExpansion({ ...defaultExpansion, __version: version })}
                >
                  <WarningIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            )}
          </TableCell>
          <TableCell align="right" sx={{ ...bodyCellSx, width: '1%', whiteSpace: 'nowrap' }}>
            {hasAccess && (
              <IconButton size="small" onClick={event => openRowMenu(event, version)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            colSpan={5}
            sx={[{ p: 0, borderColor: 'surface.nv80' }, expanded ? { borderBottom: '1px solid' } : { borderBottom: 0 }]}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ px: 2, py: 1, backgroundColor: 'surface.n96' }}>
                <ExpansionRowList
                  expansions={versionExpansions}
                  loading={versionLoading}
                  isStale={isStaleExpansion}
                  processingState={expansion => processingStatusByExpansion[expansion.url]?.state || (isExpansionProcessing(expansion) ? 'processing' : null)}
                  getRepoUpdates={expansion => repoUpdatesByExpansion[expansion.url]}
                  onSelectExpansion={expansion => setDetailsExpansion(expansion)}
                  onOpenExpansionMenu={(event, expansion) => openExpansionMenu(event, version, expansion)}
                  onRebuild={expansion => setRebuildExpansion({ ...expansion, __version: version })}
                />
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  const versionsCount = totalCount || displayVersions.length;
  const countLabel = `${versionsCount.toLocaleString()} ${t('repo.versions').toLowerCase()}`;
  const isLoading = loading || isLoadingVersions;

  const handleChangePage = (event, nextPageIndex) => {
    const nextPage = nextPageIndex + 1;
    setPage(nextPage);
    fetchVersionsPage(nextPage, pageSize);
  };

  const handleChangeRowsPerPage = event => {
    const nextPageSize = parseInt(event.target.value, 10);
    setPage(1);
    setPageSize(nextPageSize);
    fetchVersionsPage(1, nextPageSize);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 285px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
      <Toolbar
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: '48px !important',
          pl: { sm: 1 },
          pr: { xs: 1, sm: 1 }
        }}
      >
        <Typography sx={{ fontSize: 'inherit', marginLeft: '8px' }} variant="h6" component="div">
          {countLabel}
        </Typography>
      </Toolbar>
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>{t('common.id')}</TableCell>
              <TableCell sx={headerCellSx}>{t('common.content_summary')}</TableCell>
              <TableCell sx={headerCellSx}>{t('common.status')}</TableCell>
              <TableCell sx={headerCellSx} />
              <TableCell align="right" sx={headerCellSx}>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && [1, 2, 3].map(index => (
              <TableRow key={index}>
                <TableCell colSpan={5} sx={bodyCellSx}><Skeleton height={32} /></TableCell>
              </TableRow>
            ))}
            {!isLoading && displayVersions.map(renderVersionRow)}
            {!isLoading && displayVersions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={bodyCellSx}>
                  <Alert severity="info">{t('repo.no_versions_found')}</Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={versionsCount}
        rowsPerPage={pageSize || REPO_VERSIONS_PAGE_SIZE}
        page={Math.max((page || 1) - 1, 0)}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton
        showLastButton
        sx={{
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiToolbar-root': { height: '40px', minHeight: '40px' },
          '& .MuiTablePagination-actions svg': { color: 'surface.contrastText' },
          '& .MuiTablePagination-actions .Mui-disabled.MuiIconButton-root svg': { color: 'rgba(0, 0, 0, 0.26)' }
        }}
      />

      <RepoVersionRowMenu
        anchorEl={rowMenu.anchorEl}
        open={Boolean(rowMenu.anchorEl)}
        onClose={closeRowMenu}
        items={rowMenu.version ? buildRowMenuItems(rowMenu.version) : []}
      />

      <RepoVersionRowMenu
        anchorEl={expansionMenu.anchorEl}
        open={Boolean(expansionMenu.anchorEl)}
        onClose={closeExpansionMenu}
        items={buildExpansionMenuItems()}
      />

      <ExpansionForm
        open={expansionFormState.open}
        onClose={() => setExpansionFormState({ open: false, version: null, copyFrom: null })}
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
          setExpansionFormState({ open: true, version: expansion.__version, copyFrom: expansion });
        }}
      />
      <DeleteEntityDialog
        open={deleteExpansion}
        onClose={() => setDeleteExpansion(false)}
        onSubmit={onDeleteExpansionSubmit}
        entityType={t('repo.collection_expansion')}
        entityId={deleteExpansion?.mnemonic || ''}
        relationship=""
        associationsLabel={t('repo.concepts_and_mappings')}
        warning={false}
      />
    </Box>
  );
};

export default CollectionVersionsTab;
