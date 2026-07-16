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
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
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
  TextField,
  Tooltip,
  Toolbar,
  Typography
} from '@mui/material';
import {
  AttachFile as ExternalExportIcon,
  CheckCircleOutlined as ReleasedIcon,
  ContentCopy as CopyIcon,
  DeleteOutlined as DeleteIcon,
  Download as ExportIcon,
  EditOutlined as EditIcon,
  MoreVert as MoreVertIcon,
  NewReleases as ReleaseIcon,
  Newspaper as ChangelogIcon,
  OpenInNew as OpenInNewIcon,
  RadioButtonUnchecked as DraftIcon,
  Summarize as SummaryIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import map from 'lodash/map';

import APIService from '../../services/APIService';
import {
  copyToClipboard,
  currentUserHasAccess,
  dropVersion,
  formatDate,
  headFirst,
  isLoggedIn,
  toFullAPIURL
} from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';
import AccessIcon from '../common/AccessIcon';
import MarkdownContent from '../common/MarkdownContent';
import ConceptIcon from '../concepts/ConceptIcon';
import MappingIcon from '../mappings/MappingIcon';

const bodyCellSx = {
  borderBottom: '1px solid',
  borderColor: 'surface.nv80',
  verticalAlign: 'middle'
};

const headerCellSx = {
  backgroundColor: 'background.paper',
  borderBottom: '1px solid',
  borderColor: 'surface.nv80',
  color: 'surface.contrastText',
  fontSize: '12px',
  fontWeight: 'bold',
  lineHeight: '1.2rem',
  padding: '3px 16px'
};

const isHeadVersion = version => (version?.version || version?.id) === 'HEAD';
const getVersionLabel = version => version?.version || version?.id || '-';
const getVersionURL = version => isHeadVersion(version) ? `${version?.version_url || version?.url}HEAD/` : version?.version_url || version?.url;
const getPreviousVersionURL = version => version?.previous_version_url;
const getContentCount = (version, field) => get(version, `summary.${field}`);
const formatCount = value => isNumber(value) ? value.toLocaleString() : '-';
const formatError = (value, fallback) => {
  if(!value) return fallback;
  if(typeof value === 'string') return value;
  return value.detail || value.error || value.__all__ || fallback;
};

const downloadBlob = (response, fallbackName) => {
  const contentType = get(response, 'headers.content-type') || get(response, 'data.type') || 'application/octet-stream';
  const contentDisposition = get(response, 'headers.content-disposition', '');
  const filenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i) || contentDisposition.match(/filename="?([^";]+)"?/i);
  const filename = filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1].replace(/"/g, '').trim()) : fallbackName;
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const VersionExportDialog = ({ version, open, onClose }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const [loading, setLoading] = React.useState(false);
  const [state, setState] = React.useState(null);
  const [error, setError] = React.useState('');
  const exportURL = `${getVersionURL(version)}export/`;

  const checkExport = React.useCallback(() => {
    if(!open || !version) return;
    setLoading(true);
    setState(null);
    setError('');
    APIService.new().overrideURL(exportURL).request('GET', null, null, { responseType: 'blob' })
      .then(response => {
        if(response.status === 200) {
          downloadBlob(response, `${version.short_code || version.id}-${getVersionLabel(version)}.zip`);
          setState('downloaded');
        } else if(response.status === 204) {
          setState('missing');
        } else if(response.status === 208) {
          setState('processing');
        } else {
          setError(formatError(response, t('repo.could_not_check_export')));
        }
      })
      .catch(err => setError(formatError(get(err, 'response.data') || err, t('repo.could_not_check_export'))))
      .finally(() => setLoading(false));
  }, [exportURL, open, t, version]);

  React.useEffect(() => {
    checkExport();
  }, [checkExport]);

  const queueExport = () => {
    setLoading(true);
    APIService.new().overrideURL(exportURL).post(null, null, null, { noRedirect: true }, true).then(response => {
      const status = response?.status || response?.response?.status;
      if([202, 204, 409].includes(status)) {
        setState(status === 204 ? 'exists' : 'queued');
        setAlert({ severity: 'success', message: status === 204 ? t('repo.export_already_exists') : t('repo.export_request_queued') });
      } else {
        setError(formatError(response?.data || response, t('repo.could_not_queue_export')));
      }
    }).finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('repo.export_source_version_title', { repo: version?.short_code || version?.id, version: getVersionLabel(version) })}</DialogTitle>
      <DialogContent dividers>
        {loading && <Alert severity="warning" icon={<CircularProgress size={16} />}>{t('repo.checking_export_status')}</Alert>}
        {!loading && state === 'downloaded' && <Alert severity="success">{t('repo.downloaded_cached_export')}</Alert>}
        {!loading && state === 'processing' && <Alert severity="warning">{t('repo.cached_export_generating')}</Alert>}
        {!loading && state === 'queued' && <Alert severity="success">{t('repo.export_request_queued_check_later')}</Alert>}
        {!loading && state === 'exists' && <Alert severity="info">{t('repo.export_already_exists_try_again')}</Alert>}
        {!loading && state === 'missing' && (
          <Stack spacing={2}>
            <Alert severity="warning">{t('repo.no_cached_export')}</Alert>
            <Button variant="contained" onClick={queueExport} startIcon={<ExportIcon />}>{t('repo.queue_export')}</Button>
          </Stack>
        )}
        {Boolean(error) && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

const ExternalExportsDialog = ({ version, open, onClose, canEdit, onChange }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const [exports, setExports] = React.useState(get(version, 'external_exports', []));
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [busyKey, setBusyKey] = React.useState('');
  const canUpload = Boolean(canEdit && !isHeadVersion(version));

  React.useEffect(() => {
    setExports(get(version, 'external_exports', []));
  }, [version]);

  const updateExports = nextExports => {
    setExports(nextExports);
    if(onChange) onChange({ ...version, external_exports: nextExports });
  };

  const download = externalExport => {
    const url = externalExport.url || `${version.version_url}export/${externalExport.key}/`;
    setBusyKey(externalExport.key);
    APIService.new().overrideURL(url).request('GET', null, null, { responseType: 'blob' })
      .then(response => {
        if(response.status === 200) downloadBlob(response, externalExport.filename || externalExport.key);
        else setAlert({ severity: 'error', message: t('repo.could_not_download_external_export') });
      })
      .catch(() => setAlert({ severity: 'error', message: t('repo.could_not_download_external_export') }))
      .finally(() => setBusyKey(''));
  };

  const upload = () => {
    const key = (name || '').replace(/\s/g, '');
    if(!key || !file) {
      setAlert({ severity: 'error', message: t('repo.external_export_required') });
      return;
    }
    const data = new FormData();
    data.append('file', file);
    if(description) data.append('description', description);
    setBusyKey('upload');
    APIService.new().overrideURL(`${version.version_url}export/${key}/`).request('POST', data, null, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(response => {
        updateExports([...exports, response.data]);
        setName('');
        setDescription('');
        setFile(null);
        setAlert({ severity: 'success', message: t('repo.external_export_uploaded') });
      })
      .catch(error => setAlert({ severity: 'error', message: formatError(get(error, 'response.data'), t('repo.could_not_upload_external_export')) }))
      .finally(() => setBusyKey(''));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('repo.external_exports_title', { repo: version?.short_code || version?.id, version: getVersionLabel(version) })}</DialogTitle>
      <DialogContent dividers>
        {
          isEmpty(exports) ?
            <Alert severity="info">{t('repo.no_external_exports')}</Alert> :
            <List dense>
              {map(exports, externalExport => (
                <ListItem key={externalExport.key} divider>
                  <ListItemText primary={externalExport.key} secondary={externalExport.description || t('repo.no_description')} />
                  <ListItemSecondaryAction>
                    {busyKey === externalExport.key ? <CircularProgress size={18} /> : (
                      <IconButton size="small" onClick={() => download(externalExport)}>
                        <ExportIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
        }
        {
          canUpload && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('repo.upload_external_export')}</Typography>
              <TextField fullWidth size="small" label={t('common.name')} value={name} onChange={event => setName(event.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" label={t('common.description')} value={description} onChange={event => setDescription(event.target.value)} sx={{ mb: 1 }} />
              <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
              }}>
                <Button component="label" variant="outlined" size="small" startIcon={<UploadIcon />}>
                  {t('repo.choose_file')}
                  <input hidden type="file" accept=".sql,.zip,.pdf,.csv" onChange={event => setFile(get(event, 'target.files.0') || null)} />
                </Button>
                <Typography variant="body2" sx={{
                  color: "text.secondary"
                }}>{file ? file.name : t('repo.external_export_file_types')}</Typography>
              </Stack>
            </Box>
          )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
        {canUpload && <Button variant="contained" disabled={busyKey === 'upload'} onClick={upload}>{busyKey === 'upload' ? t('repo.uploading') : t('common.upload')}</Button>}
      </DialogActions>
    </Dialog>
  );
};
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
  versions,
  count,
  page,
  pageSize,
  loading,
  onPageChange,
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
  const [headVersion, setHeadVersion] = React.useState(isHeadVersion(repo) ? repo : null);
  const baseRepoURL = dropVersion(repo?.version_url || repo?.url || '');
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
  const versionsCount = count || sortedVersions.length;
  const countLabel = versionsCount === 1
    ? t('repo.source_version_count', { count: versionsCount.toLocaleString() })
    : t('repo.source_versions_count', { count: versionsCount.toLocaleString() });
  const handleChangePage = (event, nextPage) => onPageChange?.(nextPage + 1, pageSize);
  const handleChangeRowsPerPage = event => onPageChange?.(1, parseInt(event.target.value, 10));
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
            {loading && [1, 2, 3].map(index => (
              <TableRow key={index}>
                <TableCell colSpan={6} sx={bodyCellSx}><Skeleton height={32} /></TableCell>
              </TableRow>
            ))}
            {!loading && sortedVersions.map(version => {
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
                    {isHEAD && (
                      <Stack direction="row" spacing={0.5} sx={{
                        alignItems: "center"
                      }}>
                        <DraftIcon sx={{ width: 17, height: 17 }} />
                        <Typography variant="body2">{t('common.draft')}</Typography>
                      </Stack>
                    )}
                    {!isHEAD && version.released && (
                      <Stack direction="row" spacing={0.5} sx={{
                        alignItems: "center"
                      }}>
                        <ReleasedIcon color="primary" sx={{ width: 17, height: 17 }} />
                        <Typography variant="body2" color="primary">{t('common.released')}</Typography>
                      </Stack>
                    )}
                    {!isHEAD && !version.released && (
                      <Typography variant="body2">{t('repo.unreleased')}</Typography>
                    )}
                    {version.retired && <Typography variant="caption" color="error" sx={{ display: 'block' }}>{t('common.retired')}</Typography>}
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
            {!loading && sortedVersions.length === 0 && (
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
    </Box>
  );
};

export default SourceVersionsTab;
