/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
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
  Stack,
  TextField,
  Typography
} from '@mui/material';
import {
  Download as ExportIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

import APIService from '../../services/APIService';
import { OperationsContext } from '../app/LayoutContext';
import { downloadBlob } from './VersionExportDialog';
import { formatError, getVersionLabel, isHeadVersion } from './versionsTab.styles';

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

  const onFileChange = event => {
    const file = get(event, 'target.files.0') || null
    setFile(file)
    if(file?.name && !name)
      setName(file?.name)
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
                  <input hidden type="file" accept=".sql,.zip,.pdf,.csv" onChange={onFileChange} />
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

export default ExternalExportsDialog;
