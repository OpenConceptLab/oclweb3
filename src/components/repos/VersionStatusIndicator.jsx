import React from 'react';
import { Stack, Typography } from '@mui/material';
import {
  CheckCircleOutlined as ReleasedIcon,
  RadioButtonUnchecked as DraftIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const VersionStatusIndicator = ({ isHead, released, retired }) => {
  const { t } = useTranslation();

  return (
    <>
      {isHead && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <DraftIcon sx={{ width: 17, height: 17 }} />
          <Typography variant="body2">{t('common.draft')}</Typography>
        </Stack>
      )}
      {!isHead && released && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <ReleasedIcon color="primary" sx={{ width: 17, height: 17 }} />
          <Typography variant="body2" color="primary">{t('common.released')}</Typography>
        </Stack>
      )}
      {!isHead && !released && (
        <Typography variant="body2">{t('repo.unreleased')}</Typography>
      )}
      {retired && (
        <Typography variant="caption" color="error" sx={{ display: 'block' }}>{t('common.retired')}</Typography>
      )}
    </>
  );
};

export default VersionStatusIndicator;
