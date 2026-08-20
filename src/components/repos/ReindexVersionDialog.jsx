import React from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContent from '@mui/material/DialogContent';

import APIService from '../../services/APIService';
import Button from '../common/Button';
import Dialog from '../common/Dialog';
import DialogTitle from '../common/DialogTitle';
import { formatError } from './versionsTab.styles';

// `targetUrl` is the base resource URL to POST `${contentType}/${indexPath}/` onto —
// a source/collection version URL (indexPath 'indexes'), or a collection expansion
// URL (indexPath 'index').
const ReindexVersionDialog = ({ open, targetUrl, repoId, contentType, indexPath = 'indexes', label, onClose }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    if(open) {
      setSubmitting(false);
      setResult(null);
    }
  }, [open, targetUrl, contentType]);

  if(!targetUrl) return null;

  const contentTypeLabel = t(contentType === 'mappings' ? 'search.mappings' : 'search.concepts').toLowerCase();

  const handleClose = () => {
    if(submitting) return;
    onClose(result);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    APIService.new()
      .overrideURL(targetUrl)
      .appendToUrl(`${contentType}/${indexPath}/`)
      .post(null, null, null, null, true)
      .then(response => {
        const status = response?.status || response?.response?.status;
        const data = response?.data || response?.response?.data;
        setSubmitting(false);
        if(status === 202)
          setResult({ status, taskId: data?.id || null });
        else if(status === 409)
          setResult({ status, taskId: data?.id || null });
        else
          setResult({ status, error: formatError(data, t('common.generic_error')) });
      });
  };

  return (
    <Dialog open={Boolean(open)} onClose={handleClose}>
      <DialogTitle>{t('repo.reindex_dialog_title', { label, repoId })}</DialogTitle>
      <DialogContent sx={{ padding: '16px 0 0 0 !important', minWidth: 360 }}>
        {!result && (
          <>
            <p style={{ fontSize: '1rem' }}>{t('repo.reindex_confirm_message', { contentType: contentTypeLabel, repoId })}</p>
            {submitting ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Button sx={{ marginTop: '24px' }} color="primary" label={t('common.submit')} onClick={handleSubmit} />
            )}
          </>
        )}
        {result && (
          <>
            {result.status === 202 && (
              <Alert severity="success">
                {result.taskId ? t('repo.reindex_scheduled', { id: result.taskId }) : t('repo.reindex_scheduled_no_id')}
              </Alert>
            )}
            {result.status === 409 && <Alert severity="warning">{t('repo.reindex_already_in_progress')}</Alert>}
            {![202, 409].includes(result.status) && <Alert severity="error">{result.error}</Alert>}
            <Button sx={{ marginTop: '24px' }} label={t('common.close')} onClick={() => onClose(result)} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReindexVersionDialog;
