import React from 'react';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const DISMISSED_KEY = 'alphaBannerDismissed';

export const isAlphaBannerDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const rememberDismissal = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, 'true');
  } catch {
    // storage unavailable (private mode, blocked cookies); the banner simply reappears
  }
};

const AlphaBanner = () => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(!isAlphaBannerDismissed());

  const onClose = () => {
    rememberDismissal();
    setOpen(false);
  };

  if (!open)
    return null;

  return (
    <Alert
      severity='info'
      onClose={onClose}
      closeText={t('common.dismiss')}
      sx={{ margin: '8px 0', borderRadius: '8px' }}
    >
      <AlertTitle sx={{ marginBottom: 0 }}>{t('common.alpha_banner_title')}</AlertTitle>
      {t('common.alpha_banner_message')}
    </Alert>
  );
};

export default AlphaBanner;
