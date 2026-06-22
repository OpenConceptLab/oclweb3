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
  TableRow,
  TextField,
  Tooltip,
  Toolbar,
  Typography
} from '@mui/material';
import {
  AttachFile as ExternalExportIcon,
  CheckCircleOutline as ReleasedIcon,
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon,
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
  formatDateTime,
  headFirst,
  isLoggedIn,
  toFullAPIURL
} from '../../common/utils';
import { OperationsContext } from '../app/LayoutContext';
import AccessIcon from '../common/AccessIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import MappingIcon from '../mappings/MappingIcon';

const bodyCellSx = {
  borderBottom: '1px solid',
  borderColor: 'surface.nv80',
  verticalAlign: 'middle'
};

const headerCellSx = {
  backgroundColor: 'white',
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
const formatError = (value, fallback = 'Something went wrong.') => {
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

const renderInlineMarkdown = text => {
  const tokens = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while((match = pattern.exec(text || ''))) {
    if(match.index > lastIndex)
      tokens.push(text.slice(lastIndex, match.index));

    if(match[2])
      tokens.push(<strong key={tokens.length}>{match[2]}</strong>);
    else if(match[3])
      tokens.push(<em key={tokens.length}>{match[3]}</em>);
    else if(match[4])
      tokens.push(<Box component="code" key={tokens.length} sx={{ fontFamily: 'monospace', px: 0.5, bgcolor: 'surface.main', borderRadius: '3px' }}>{match[4]}</Box>);
    else if(match[5])
      tokens.push(<a key={tokens.length} href={match[6]} target="_blank" rel="noopener noreferrer">{match[5]}</a>);

    lastIndex = pattern.lastIndex;
  }

  if(lastIndex < (text || '').length)
    tokens.push(text.slice(lastIndex));

  return tokens;
};

const parseMarkdownTable = lines => {
  if(lines.length < 2 || !lines[0].trim().startsWith('|') || !lines[1].includes('---'))
    return null;

  const parseRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
  const headers = parseRow(lines[0]);
  const rows = [];
  let nextIndex = 2;

  while(nextIndex < lines.length && lines[nextIndex].trim().startsWith('|')) {
    rows.push(parseRow(lines[nextIndex]));
    nextIndex += 1;
  }

  return { headers, rows, nextIndex };
};

const MarkdownContent = ({ markdown }) => {
  const lines = (markdown || '').split('\n');
  const elements = [];
  let index = 0;

  while(index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if(!trimmed) {
      index += 1;
      continue;
    }

    if(trimmed === '---') {
      elements.push(<Divider key={elements.length} sx={{ my: 2 }} />);
      index += 1;
      continue;
    }

    const table = parseMarkdownTable(lines.slice(index));
    if(table) {
      elements.push(
        <TableContainer key={elements.length} sx={{ my: 2, border: '1px solid', borderColor: 'surface.nv80', borderRadius: '4px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {table.headers.map(header => <TableCell key={header} sx={{ fontWeight: 700 }}>{renderInlineMarkdown(header)}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => <TableCell key={`${rowIndex}-${cellIndex}`}>{renderInlineMarkdown(cell)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
      index += table.nextIndex;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if(heading) {
      const variant = heading[1].length <= 1 ? 'h6' : 'subtitle1';
      elements.push(
        <Typography key={elements.length} variant={variant} sx={{ mt: elements.length ? 2.5 : 0, mb: 1, fontWeight: 700 }}>
          {renderInlineMarkdown(heading[2])}
        </Typography>
      );
      index += 1;
      continue;
    }

    if(trimmed.startsWith('>')) {
      elements.push(
        <Box key={elements.length} sx={{ borderLeft: '3px solid', borderColor: 'primary.main', pl: 1.5, my: 1.5, color: 'text.secondary' }}>
          <Typography variant="body2">{renderInlineMarkdown(trimmed.replace(/^>\s?/, ''))}</Typography>
        </Box>
      );
      index += 1;
      continue;
    }

    elements.push(
      <Typography key={elements.length} variant="body2" sx={{ my: 1, lineHeight: 1.6 }}>
        {renderInlineMarkdown(trimmed)}
      </Typography>
    );
    index += 1;
  }

  return <Box sx={{ '& a': { color: 'primary.main' } }}>{elements}</Box>;
};

const VersionExportDialog = ({ version, open, onClose }) => {
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
          setError(formatError(response, 'Could not check export.'));
        }
      })
      .catch(err => setError(formatError(get(err, 'response.data') || err, 'Could not check export.')))
      .finally(() => setLoading(false));
  }, [exportURL, open, version]);

  React.useEffect(() => {
    checkExport();
  }, [checkExport]);

  const queueExport = () => {
    setLoading(true);
    APIService.new().overrideURL(exportURL).post(null, null, null, { noRedirect: true }, true).then(response => {
      const status = response?.status || response?.response?.status;
      if([202, 204, 409].includes(status)) {
        setState(status === 204 ? 'exists' : 'queued');
        setAlert({ severity: 'success', message: status === 204 ? 'An export already exists for this version.' : 'Export request queued.' });
      } else {
        setError(formatError(response?.data || response, 'Could not queue export.'));
      }
    }).finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{`Export Source Version: ${version?.short_code || version?.id} / ${getVersionLabel(version)}`}</DialogTitle>
      <DialogContent dividers>
        {loading && <Alert severity="warning" icon={<CircularProgress size={16} />}>Checking export status...</Alert>}
        {!loading && state === 'downloaded' && <Alert severity="success">Downloaded cached export.</Alert>}
        {!loading && state === 'processing' && <Alert severity="warning">A cached export is being generated. Check again later.</Alert>}
        {!loading && state === 'queued' && <Alert severity="success">Export request queued. Check again later.</Alert>}
        {!loading && state === 'exists' && <Alert severity="info">An export already exists. Try downloading again.</Alert>}
        {!loading && state === 'missing' && (
          <Stack spacing={2}>
            <Alert severity="warning">There is no cached export for this source version.</Alert>
            <Button variant="contained" onClick={queueExport} startIcon={<ExportIcon />}>Queue Export</Button>
          </Stack>
        )}
        {Boolean(error) && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const ExternalExportsDialog = ({ version, open, onClose, canEdit, onChange }) => {
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
        if(response.status === 200) downloadBlob(response, externalExport.file_path?.split('/').pop() || externalExport.key);
        else setAlert({ severity: 'error', message: 'Could not download external export.' });
      })
      .catch(() => setAlert({ severity: 'error', message: 'Could not download external export.' }))
      .finally(() => setBusyKey(''));
  };

  const upload = () => {
    const key = (name || '').replace(/\s/g, '');
    if(!key || !file) {
      setAlert({ severity: 'error', message: 'External export name and file are required.' });
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
        setAlert({ severity: 'success', message: 'External export uploaded.' });
      })
      .catch(error => setAlert({ severity: 'error', message: formatError(get(error, 'response.data'), 'Could not upload external export.') }))
      .finally(() => setBusyKey(''));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{`External Exports: ${version?.short_code || version?.id} / ${getVersionLabel(version)}`}</DialogTitle>
      <DialogContent dividers>
        {
          isEmpty(exports) ?
            <Alert severity="info">No external exports have been uploaded for this version.</Alert> :
            <List dense>
              {map(exports, externalExport => (
                <ListItem key={externalExport.key} divider>
                  <ListItemText primary={externalExport.key} secondary={externalExport.description || 'No description'} />
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
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload External Export</Typography>
              <TextField fullWidth size="small" label="Name" value={name} onChange={event => setName(event.target.value)} sx={{ mb: 1 }} />
              <TextField fullWidth size="small" label="Description" value={description} onChange={event => setDescription(event.target.value)} sx={{ mb: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button component="label" variant="outlined" size="small" startIcon={<UploadIcon />}>
                  Choose File
                  <input hidden type="file" accept=".sql,.zip,.pdf,.csv" onChange={event => setFile(get(event, 'target.files.0') || null)} />
                </Button>
                <Typography variant="body2" color="text.secondary">{file ? file.name : 'sql, zip, pdf, csv'}</Typography>
              </Stack>
            </Box>
          )
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {canUpload && <Button variant="contained" disabled={busyKey === 'upload'} onClick={upload}>{busyKey === 'upload' ? 'Uploading...' : 'Upload'}</Button>}
      </DialogActions>
    </Dialog>
  );
};

const ChangelogDialog = ({ version, open, onClose }) => {
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
      else setError(formatError(get(response, 'detail') || get(response, 'error'), 'Could not load changelog.'));
    }).catch(() => setError('Could not load changelog.')).finally(() => {
      if(timerRef.current) clearTimeout(timerRef.current);
      setLoading(false);
    });
    return () => {
      if(timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, previousVersionURL, version]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{`Changelog: ${previousVersionURL?.split('/').filter(Boolean).pop()} -> ${getVersionLabel(version)}`}</DialogTitle>
      <DialogContent dividers sx={{ height: '70vh', overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', minHeight: 240, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <CircularProgress />
            {showLongMessage && <Typography sx={{ mt: 2, color: 'text.secondary' }}>Large sources can take a while to process.</Typography>}
          </Box>
        )}
        {!loading && Boolean(error) && <Alert severity="error">{error}</Alert>}
        {!loading && Boolean(markdown) && (
          <MarkdownContent markdown={markdown} />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const SourceVersionsTab = ({
  repo,
  versions,
  count,
  loading,
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
  const sortedVersions = React.useMemo(() => headFirst(Array.isArray(versions) ? versions : []), [versions]);
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
    setAlert({ severity: 'success', message: 'Copied version URL.' });
  };
  const computeSummary = version => {
    APIService.new().overrideURL(version.version_url).appendToUrl('summary/').put().then(response => {
      if(response.detail || response.error)
        setAlert({ severity: 'error', message: formatError(response.detail || response.error) });
      else if(response.status === 202)
        setAlert({ severity: 'success', message: 'Summary request queued.' });
      else
        setAlert({ severity: 'warning', message: 'Summary request submitted.' });
    });
  };
  const onExternalExportsChange = updatedVersion => {
    if(onDataChange) onDataChange(updatedVersion);
  };
  const versionsCount = count || sortedVersions.length;
  const countLabel = `${versionsCount.toLocaleString()} source ${versionsCount === 1 ? 'version' : 'versions'}`;

  return (
    <Box sx={{ height: 'calc(100vh - 285px)', overflow: 'hidden', backgroundColor: '#FFF' }}>
      <Toolbar
        sx={{
          bgcolor: '#FFF',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          minHeight: '48px !important',
          pl: { sm: 1 },
          pr: { xs: 1, sm: 1 }
        }}
      >
        <Typography
          sx={{ flex: '1 1 100%', whiteSpace: 'nowrap' }}
          variant="h7"
          component="div"
        >
          {countLabel}
        </Typography>
      </Toolbar>
      <TableContainer sx={{ height: 'calc(100% - 49px)' }}>
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
                    {version?.match_algorithms?.includes('llm') && <Chip size="small" label="Mapper" variant="outlined" sx={{ ml: 1, height: 20 }} />}
                    {version.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {version.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Stack direction="row" spacing={1.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ConceptIcon selected color="secondary" sx={{ width: 12, height: 12 }} />
                        <Typography variant="body2">{formatCount(getContentCount(version, 'active_concepts'))}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MappingIcon width="15px" height="13px" fill="secondary.main" color="secondary" />
                        <Typography variant="body2">{formatCount(getContentCount(version, 'active_mappings'))}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AccessIcon sx={{ width: 17, height: 17 }} public_access={version.public_access} />
                      <Typography variant="body2">{isPublic ? t('common.public') : t('common.private')}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    {isHEAD && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <DraftIcon sx={{ width: 17, height: 17 }} />
                        <Typography variant="body2">{t('common.draft')}</Typography>
                      </Stack>
                    )}
                    {!isHEAD && version.released && (
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <ReleasedIcon color="primary" sx={{ width: 17, height: 17 }} />
                        <Typography variant="body2" color="primary">{t('common.released')}</Typography>
                      </Stack>
                    )}
                    {!isHEAD && !version.released && (
                      <Typography variant="body2">Unreleased</Typography>
                    )}
                    {version.retired && <Typography variant="caption" color="error" sx={{ display: 'block' }}>{t('common.retired')}</Typography>}
                  </TableCell>
                  <TableCell sx={bodyCellSx}>
                    <Typography variant="body2">{version.created_on ? formatDateTime(version.created_on) : '-'}</Typography>
                    <Typography variant="caption" color="text.secondary">{version.created_by || ''}</Typography>
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
                  <Alert severity="info">No versions found.</Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu anchorEl={menuState.anchorEl} open={Boolean(menuState.anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={() => withClose(version => onVersionChange(version))}><VisibilityIcon fontSize="small" sx={{ mr: 1 }} />Explore Version</MenuItem>
        <MenuItem onClick={() => withClose(version => copyVersionURL(version))}><CopyIcon fontSize="small" sx={{ mr: 1 }} />Copy URL</MenuItem>
        <MenuItem onClick={() => withClose(version => setExportVersion(version))} disabled={!isLoggedIn()}><ExportIcon fontSize="small" sx={{ mr: 1 }} />Export Version</MenuItem>
        <MenuItem onClick={() => withClose(version => setExternalExportsVersion(version))} disabled={!isLoggedIn() || isHeadVersion(menuState.version)}><ExternalExportIcon fontSize="small" sx={{ mr: 1 }} />External Exports</MenuItem>
        <MenuItem onClick={() => withClose(version => setChangelogVersion(version))} disabled={!getPreviousVersionURL(menuState.version)}><ChangelogIcon fontSize="small" sx={{ mr: 1 }} />Changelog</MenuItem>
        <MenuItem onClick={() => withClose(compareVersion)} disabled={!getPreviousVersionURL(menuState.version)}><OpenInNewIcon fontSize="small" sx={{ mr: 1 }} />Compare with Previous</MenuItem>
        {hasAccess && <Divider />}
        {hasAccess && <MenuItem onClick={() => withClose(onEditVersion)} disabled={isHeadVersion(menuState.version)}><EditIcon fontSize="small" sx={{ mr: 1 }} />{t('common.edit')}</MenuItem>}
        {hasAccess && <MenuItem onClick={() => withClose(onReleaseVersion)} disabled={isHeadVersion(menuState.version)}><ReleaseIcon fontSize="small" sx={{ mr: 1 }} />{menuState.version?.released ? 'Unrelease Version' : 'Release Version'}</MenuItem>}
        {hasAccess && <MenuItem onClick={() => withClose(computeSummary)}><SummaryIcon fontSize="small" sx={{ mr: 1 }} />Re-compute Summary</MenuItem>}
        {hasAccess && <MenuItem onClick={() => withClose(onDeleteVersion)} disabled={menuState.version?.retired}><DeleteIcon fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem>}
      </Menu>
      {Boolean(exportVersion) && <VersionExportDialog version={exportVersion} open={Boolean(exportVersion)} onClose={() => setExportVersion(null)} />}
      {Boolean(externalExportsVersion) && <ExternalExportsDialog version={externalExportsVersion} canEdit={hasAccess} open={Boolean(externalExportsVersion)} onClose={() => setExternalExportsVersion(null)} onChange={onExternalExportsChange} />}
      {Boolean(changelogVersion) && <ChangelogDialog version={changelogVersion} open={Boolean(changelogVersion)} onClose={() => setChangelogVersion(null)} />}
    </Box>
  );
};

export default SourceVersionsTab;
