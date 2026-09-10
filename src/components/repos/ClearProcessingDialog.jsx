import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Alert, Box, CircularProgress, DialogContent } from '@mui/material';

import APIService from '../../services/APIService';
import { OperationsContext } from '../app/LayoutContext';
import Button from '../common/Button';
import Dialog from '../common/Dialog';
import DialogTitle from '../common/DialogTitle';
import ProcessingStagesList from './ProcessingStagesList';
import { hasProcessingStages, isVersionProcessing } from './processingStages';
import { formatError, getVersionLabel, getVersionURL } from './versionsTab.styles';

// Staff escape hatch for a version whose background task ids outlived the tasks
// themselves, leaving it stuck reporting `is_processing` forever.
const ClearProcessingDialog = ({ version, open, onClose, onCleared }) => {
  const { t } = useTranslation();
  const { setAlert } = React.useContext(OperationsContext);
  const [loading, setLoading] = React.useState(false);

  const entityId = `${version?.short_code || version?.id} [${getVersionLabel(version)}]`;
  const showStages = hasProcessingStages(version);

  const onSubmit = () => {
    setLoading(true);
    APIService.new()
      .overrideURL(getVersionURL(version))
      .appendToUrl('processing/')
      .post(null, null, null, null, true)
      .then(response => {
        const status = response?.status || response?.response?.status;
        if(status === 200) {
          setAlert({ severity: 'success', message: t('repo.processing_cleared') });
          onCleared?.();
          onClose();
        } else {
          setAlert({
            severity: 'error',
            message: formatError(response?.data || response, t('repo.could_not_clear_processing'))
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={Boolean(open)} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Trans
          i18nKey="repo.clear_processing_title"
          values={{ resourceType: t('repo.clear_processing'), resourceId: entityId }}
        />
      </DialogTitle>
      <DialogContent sx={{ padding: '16px 0 0 0 !important' }}>
        <p>{t('repo.clear_processing_confirmation')}</p>
        <p>{t('repo.clear_processing_message')}</p>
        {!isVersionProcessing(version) && (
          <Alert severity="info" sx={{ mb: 1 }}>{t('repo.clear_processing_not_processing')}</Alert>
        )}
        {showStages && (
          <Box
            sx={{
              mt: 1,
              mb: 1,
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'surface.nv80'
            }}
          >
            <ProcessingStagesList version={version} />
          </Box>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Button
            sx={{ marginTop: '24px', width: '100%', textTransform: 'uppercase' }}
            color="error"
            label={t('repo.clear_processing_confirm_button')}
            onClick={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClearProcessingDialog;
