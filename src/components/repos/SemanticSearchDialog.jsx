import React from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContent from '@mui/material/DialogContent';
import isNumber from 'lodash/isNumber';

import APIService from '../../services/APIService';
import GAService from '../../services/GAService';
import Button from '../common/Button';
import Dialog from '../common/Dialog';
import DialogTitle from '../common/DialogTitle';
import { isSemanticVersion, withSemanticSearch } from './semanticSearch';
import { formatError, getVersionURL } from './versionsTab.styles';

// Turns OCL Semantic Search on or off for a source version (staff only, in the API too). The API queues the vector
// sync when the version's match algorithms change. onClose(true) once they have.
const SemanticSearchDialog = ({ version, repoId, onClose }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const turningOn = !isSemanticVersion(version);
  const label = t(turningOn ? 'repo.version.semantic_search.turn_on' : 'repo.version.semantic_search.turn_off');
  const conceptCount = version?.summary?.active_concepts;

  const handleClose = () => {
    if(submitting) return;
    onClose(Boolean(result?.ok));
  };

  const handleSubmit = () => {
    const url = getVersionURL(version);
    GAService.recordActionEvent('Version Semantic Search', turningOn ? 'turn_on' : 'turn_off', repoId, { version: url });
    setSubmitting(true);
    APIService.new()
      .overrideURL(url)
      .put({ match_algorithms: withSemanticSearch(version?.match_algorithms, turningOn) }, null, null, null, true)
      .then(response => {
        const status = response?.status || response?.response?.status;
        const data = response?.data || response?.response?.data;
        setSubmitting(false);
        if(status === 200)
          setResult({ ok: true });
        else
          setResult({ ok: false, error: formatError(data, t('common.generic_error')) });
      });
  };

  return (
    <Dialog open onClose={handleClose}>
      <DialogTitle>{t('repo.reindex_dialog_title', { label, repoId })}</DialogTitle>
      <DialogContent sx={{ padding: '16px 0 0 0 !important', minWidth: 360 }}>
        {!result && (
          <>
            <p style={{ fontSize: '1rem' }}>
              {t(turningOn ? 'repo.version.semantic_search.turn_on_message' : 'repo.version.semantic_search.turn_off_message', { repoId })}
            </p>
            {isNumber(conceptCount) && (
              <p style={{ fontSize: '1rem' }}>{t('repo.version.semantic_search.concept_count', { count: conceptCount.toLocaleString() })}</p>
            )}
            {submitting ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Button sx={{ marginTop: '24px' }} color="primary" label={label} onClick={handleSubmit} />
            )}
          </>
        )}
        {result && (
          <>
            {result.ok ? (
              <Alert severity="success">
                {t(turningOn ? 'repo.version.semantic_search.turned_on' : 'repo.version.semantic_search.turned_off', { repoId })}
              </Alert>
            ) : <Alert severity="error">{result.error}</Alert>}
            <Button sx={{ marginTop: '24px' }} label={t('common.close')} onClick={handleClose} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SemanticSearchDialog;
