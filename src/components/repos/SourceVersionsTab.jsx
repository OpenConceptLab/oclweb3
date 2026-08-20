/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Toolbar,
  Typography
} from '@mui/material';
import {
  AttachFile as ExternalExportIcon,
  ContentCopy as CopyIcon,
  DeleteOutlined as DeleteIcon,
  Download as ExportIcon,
  EditOutlined as EditIcon,
  MoreVert as MoreVertIcon,
  NewReleases as ReleaseIcon,
  Newspaper as ChangelogIcon,
  OpenInNew as OpenInNewIcon,
  QueryStats as ReindexIcon,
  Summarize as SummaryIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import get from 'lodash/get';

import APIService from '../../services/APIService';
import {
  copyToClipboard,
  currentUserHasAccess,
  dropVersion,
  formatDate,
  headFirst,
  isLoggedIn,
  isStaffUser,
  toFullAPIURL
} from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';
import AccessIcon from '../common/AccessIcon';
import MarkdownContent from '../common/MarkdownContent';
import ConceptIcon from '../concepts/ConceptIcon';
import MappingIcon from '../mappings/MappingIcon';
import ExternalExportsDialog from './ExternalExportsDialog';
import ReindexVersionDialog from './ReindexVersionDialog';
import VersionExportDialog from './VersionExportDialog';
import VersionStatusIndicator from './VersionStatusIndicator';
import {
  REPO_VERSIONS_PAGE_SIZE,
  bodyCellSx,
  formatCount,
  formatError,
  getContentCount,
  getPreviousVersionURL,
  getVersionKey,
  getVersionLabel,
  getVersionURL,
  headerCellSx,
  isHeadVersion
} from './versionsTab.styles';

const ChangelogDialog = ({ version, open, onClose }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [markdown, setMarkdown] = React.useState('');
  const [error, setError] = React.useState('');
  const [showLongMessage, setShowLongMessage] = React.useState(false);
  const timerRef = React.useRef(null);
  const previousVersionURL = getPreviousVersionURL(version);
  React.useEffect(() => {
    if(!open || !version || !previousVersionURL) return undefined;
    setLoading(true);
    setMarkdown('');
    setError('');
    setShowLongMessage(false);
    timerRef.current = setTimeout(() => setShowLongMessage(true), 10000);
    APIService.new().overrideURL('/sources/$changelog/').post(
      { version1: previousVersionURL, version2: version.version_url || version.url, verbosity: 4 },
      null,
      null,
      { inline: true, output: 'markdown', verbosity: 4 }
    ).then(response => {
      const nextMarkdown = get(response, 'data.markdown') || get(response, 'markdown');
      if(nextMarkdown) setMarkdown(nextMarkdown);
      else setError(formatError(get(response, 'detail') || get(response, 'error'), t('repo.could_not_load_changelog')));
    }).catch(() => setError(t('repo.could_not_load_changelog'))).finally(() => {
      if(timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
    });
    return () => {
      if(timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, previousVersionURL, t, version]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`Changelog: ${previousVersionURL?.split('/').filter(Boolean).pop()} -> ${getVersionLabel(version)}`}</DialogTitle>
      <DialogContent dividers sx={{ height: '70vh', overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', minHeight: 240, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <CircularProgress />
            {showLongMessage && <Typography sx={{ mt: 2, color: 'text.secondary' }}>{t('repo.large_sources_take_a_while')}</Typography>}
          </Box>
        )}
        {!loading && Boolean(error) && <Alert severity="error">{error}</Alert>}
        {!loading && Boolean(markdown) && (
          <MarkdownContent markdown={markdown} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
const SourceVersionsTab = ({
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
  const history = useHistory();
  const { setAlert } = React.useContext(OperationsContext);
  const [menuState, setMenuState] = React.useState({ anchorEl: null, version: null });
  const [exportVersion, setExportVersion] = React.useState(null);
  const [externalExportsVersion, setExternalExportsVersion] = React.useState(null);
  const [changelogVersion, setChangelogVersion] = React.useState(null);
  const [reindexTarget, setReindexTarget] = React.useState(null);
  const [reindexWip, setReindexWip] = React.useState({});
  const [headVersion, setHeadVersion] = React.useState(isHeadVersion(repo) ? repo : null);
  const [versions, setVersions] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(REPO_VERSIONS_PAGE_SIZE);
  const [isLoadingVersions, setIsLoadingVersions] = React.useState(true);
  const baseRepoURL = dropVersion(repo?.version_url || repo?.url || '');

  const fetchVersionsPage = (nextPage, nextPageSize) => {
    if(!baseRepoURL) return;
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
    if(!baseRepoURL) {
      setHeadVersion(null);
      return;
    }
    if(isHeadVersion(repo)) {
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
  const sortedVersions = React.useMemo(() => {
    const versionList = Array.isArray(versions) ? versions : [];
    const normalizedHeadVersion = headVersion ? {
      ...headVersion,
      id: 'HEAD',
      version: 'HEAD',
      version_url: headVersion.url || headVersion.version_url || baseRepoURL
    } : null;
    const pagedVersions = page === 1
      ? [normalizedHeadVersion, ...versionList].filter(Boolean)
      : versionList.filter(version => !isHeadVersion(version));
    return headFirst(pagedVersions);
  }, [baseRepoURL, headVersion, page, versions]);
  const hasAccess = currentUserHasAccess();
  const isLoading = loading || isLoadingVersions;
  const closeMenu = () => setMenuState({ anchorEl: null, version: null });
  const withClose = callback => {
    const version = menuState.version;
    closeMenu();
    callback(version);
  };
  const compareVersion = version => {
    const previousVersionURL = getPreviousVersionURL(version);
    if(previousVersionURL)
      history.push(`${repo.url}compare-versions?version1=${previousVersionURL}&version2=${version.version_url || version.url}`);
  };
  const copyVersionURL = version => {
    copyToClipboard(toFullAPIURL(version.version_url || version.url));
    setAlert({ severity: 'success', message: t('repo.copied_version_url') });
  };
  const computeSummary = version => {
    APIService.new().overrideURL(version.version_url).appendToUrl('summary/').put().then(response => {
      if(response.detail || response.error)
        setAlert({ severity: 'error', message: formatError(response.detail || response.error, t('common.generic_error')) });
      else if(response.status === 202)
        setAlert({ severity: 'success', message: t('repo.summary_request_queued') });
      else
        setAlert({ severity: 'warning', message: t('repo.summary_request_submitted') });
    });
  };
  const onExternalExportsChange = updatedVersion => {
    if(onDataChange) onDataChange(updatedVersion);
  };
  const getReindexKey = (version, contentType) => `${getVersionKey(version)}:${contentType}`;
  const closeReindexDialog = result => {
    const target = reindexTarget;
    setReindexTarget(null);
    if(!target || !result) return;
    if(result.taskId || result.status === 409)
      setReindexWip(prev => ({ ...prev, [getReindexKey(target.version, target.contentType)]: { taskId: result.taskId } }));
  };
  const versionsCount = totalCount || sortedVersions.length;
  const countLabel = versionsCount === 1
    ? t('repo.source_version_count', { count: versionsCount.toLocaleString() })
    : t('repo.source_versions_count', { count: versionsCount.toLocaleString() });
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
        <Typography
          sx={{ flex: '1 1 100%', whiteSpace: 'nowrap', fontSize: 'inherit', marginLeft: '8px'}}
          variant="h6"
          component="div"
        >
          {countLabel}
        </Typography>
      </Toolbar>
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>{t('common.id')}</TableCell>
              <TableCell sx={headerCellSx}>{t('common.content_summary')}</TableCell>
              <TableCell sx={headerCellSx}>{t('repo.visibility')}</TableCell>
              <TableCell sx={headerCellSx}>{t('common.status')}</TableCell>
              <TableCell sx={headerCellSx}>{t('common.created')}</TableCell>
              <TableCell align="right" sx={headerCellSx}>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && [1, 2, 3].map(index => (
              <TableRow key={index}>
                <TableCell colSpan={6} sx={bodyCellSx}><Skeleton height={32} /></TableCell>
              </TableRow>
            ))}
            {!isLoading && sortedVersions.map(version => {
              const isHEAD = isHeadVersion(version);
              const isPublic = ['view', 'edit'].includes((version.public_access || '').toLowerCase());
              return (
                <TableRow hover key={version.version_url || version.url || version.id}>
                  <TableCell sx={bodyCellSx}>
                    <Button
                      size="small"
                      onClick={() => onVersionChange(version)}
                      sx={{ minWidth: 0, p: 0, textTransform: 'none', fontWeight: 700 }}
                    >
                      {getVersionLabel(version)}
                    </Button>
                    {version?.match_algorithms?.includes('llm') && <Chip size="small" label={t('repo.mapper')} variant="outlined" sx={{ ml: 1, height: 20 }} />}
                    {version.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: 'block',
                          mt: 0.25
                        }}>
                        {version.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Stack direction="row" spacing={1.5}>
                      <Stack direction="row" spacing={0.5} sx={{
                        alignItems: "center"
                      }}>
                        <ConceptIcon selected color="secondary" sx={{ width: 12, height: 12 }} />
                        <Typography variant="body2">{formatCount(getContentCount(version, 'active_concepts'))}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{
                        alignItems: "center"
                      }}>
                        <MappingIcon width="15px" height="13px" fill="secondary.main" color="secondary" />
                        <Typography variant="body2">{formatCount(getContentCount(version, 'active_mappings'))}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Stack direction="row" spacing={0.5} sx={{
                      alignItems: "center"
                    }}>
                      <AccessIcon sx={{ width: 17, height: 17 }} public_access={version.public_access} />
                      <Typography variant="body2">{isPublic ? t('common.public') : t('common.private')}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <VersionStatusIndicator isHead={isHEAD} released={version.released} retired={version.retired} />
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography variant="body2">{version.created_on ? formatDate(version.created_on) : '-'}</Typography>
                    <Typography variant="caption" sx={{
                      color: "text.secondary"
                    }}>{version.created_by || ''}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={bodyCellSx}>
                    <Tooltip title={t('common.actions')}>
                      <IconButton size="small" onClick={event => setMenuState({ anchorEl: event.currentTarget, version })}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && sortedVersions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={bodyCellSx}>
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
        rowsPerPage={pageSize || 25}
        page={Math.max((page || 1) - 1, 0)}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton
        showLastButton
        sx={{
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiToolbar-root': {
            height: '40px',
            minHeight: '40px'
          },
          '& .MuiTablePagination-actions svg': { color: 'surface.contrastText' },
          '& .MuiTablePagination-actions .Mui-disabled.MuiIconButton-root svg': { color: 'rgba(0, 0, 0, 0.26)' }
        }}
      />
      <Menu anchorEl={menuState.anchorEl} open={Boolean(menuState.anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => withClose(version => onVersionChange(version))}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.explore_version')}</MenuItem>
        <MenuItem onClick={() => withClose(version => copyVersionURL(version))}><CopyIcon fontSize="small" sx={{ mr: 1 }} />{t('common.copy_api_url')}</MenuItem>
        <MenuItem onClick={() => withClose(version => setExportVersion(version))} disabled={!isLoggedIn()}><ExportIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.export_version')}</MenuItem>
        <MenuItem onClick={() => withClose(version => setExternalExportsVersion(version))} disabled={!isLoggedIn() || isHeadVersion(menuState.version)}><ExternalExportIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.external_exports')}</MenuItem>
        {
          Boolean(getPreviousVersionURL(menuState.version)) &&
            <MenuItem onClick={() => withClose(version => setChangelogVersion(version))}><ChangelogIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.changelog')}</MenuItem>
        }
        <MenuItem onClick={() => withClose(compareVersion)} disabled={!getPreviousVersionURL(menuState.version)}><OpenInNewIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.compare_with_previous')}</MenuItem>
        {hasAccess && <Divider />}
        {hasAccess && <MenuItem onClick={() => withClose(onEditVersion)} disabled={isHeadVersion(menuState.version)}><EditIcon fontSize="small" sx={{ mr: 1 }} />{t('common.edit')}</MenuItem>}
        {hasAccess && <MenuItem onClick={() => withClose(onReleaseVersion)} disabled={isHeadVersion(menuState.version)}><ReleaseIcon fontSize="small" sx={{ mr: 1 }} />{menuState.version?.released ? t('repo.unrelease_version') : t('repo.release_version')}</MenuItem>}
        {hasAccess && <MenuItem onClick={() => withClose(computeSummary)}><SummaryIcon fontSize="small" sx={{ mr: 1 }} />{t('repo.recompute_summary')}</MenuItem>}
        {hasAccess && isStaffUser() && [
          { contentType: 'concepts', label: t('repo.reindex_concepts') },
          { contentType: 'mappings', label: t('repo.reindex_mappings') }
        ].map(({ contentType, label }) => {
          const wip = menuState.version ? reindexWip[getReindexKey(menuState.version, contentType)] : null;
          const tooltip = wip
            ? (wip.taskId ? t('repo.reindex_in_progress_tooltip_with_id', { id: wip.taskId }) : t('repo.reindex_in_progress_tooltip'))
            : '';
          return (
            <Tooltip key={contentType} title={tooltip} placement="left">
              <span>
                <MenuItem
                  disabled={Boolean(wip)}
                  onClick={() => withClose(version => setReindexTarget({ version, contentType }))}
                >
                  <ReindexIcon fontSize="small" sx={{ mr: 1 }} />{label}
                </MenuItem>
              </span>
            </Tooltip>
          );
        })}
        {
          hasAccess && !isHeadVersion(menuState.version) &&
            <>
              <Divider />
              <MenuItem
                onClick={() => withClose(onDeleteVersion)}
                disabled={menuState.version?.retired}
                sx={{ color: 'error.main', '& .MuiSvgIcon-root': { color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                {t('repo.delete_repo_version')}
              </MenuItem>
            </>
        }
      </Menu>
      {Boolean(exportVersion) && <VersionExportDialog version={exportVersion} open={Boolean(exportVersion)} onClose={() => setExportVersion(null)} />}
      {Boolean(externalExportsVersion) && <ExternalExportsDialog version={externalExportsVersion} canEdit={hasAccess} open={Boolean(externalExportsVersion)} onClose={() => setExternalExportsVersion(null)} onChange={onExternalExportsChange} />}
      {Boolean(changelogVersion) && <ChangelogDialog version={changelogVersion} open={Boolean(changelogVersion)} onClose={() => setChangelogVersion(null)} />}
      {Boolean(reindexTarget) && (
        <ReindexVersionDialog
          open={Boolean(reindexTarget)}
          targetUrl={getVersionURL(reindexTarget.version)}
          repoId={`${reindexTarget.version.short_code || reindexTarget.version.id} [${getVersionLabel(reindexTarget.version)}]`}
          contentType={reindexTarget.contentType}
          label={reindexTarget.contentType === 'mappings' ? t('repo.reindex_mappings') : t('repo.reindex_concepts')}
          onClose={closeReindexDialog}
        />
      )}
    </Box>
  );
};

export default SourceVersionsTab;
