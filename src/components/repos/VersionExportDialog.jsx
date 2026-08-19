import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material';
import { Download as ExportIcon } from '@mui/icons-material';
import get from 'lodash/get';

import APIService from '../../services/APIService';
import { OperationsContext } from '../app/LayoutContext';
import { formatError, getVersionLabel, getVersionURL } from './versionsTab.styles';

export const downloadBlob = (response, fallbackName) => {
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

const VersionExportDialog = ({ version, open, onClose, titleKey = 'repo.export_source_version_title' }) => {
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
      <DialogTitle>{t(titleKey, { repo: version?.short_code || version?.id, version: getVersionLabel(version) })}</DialogTitle>
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

export default VersionExportDialog;
