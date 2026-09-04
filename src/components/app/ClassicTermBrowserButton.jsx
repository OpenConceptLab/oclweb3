import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toV2URL } from '../../common/utils';

const ClassicTermBrowserButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const href = toV2URL(location.pathname + (location.search || ''));

  return (
    <Tooltip title={t('common.back_to_classic_termbrowser')} arrow>
      <Button
        href={href}
        size='small'
        color='secondary'
        aria-label={t('common.back_to_classic_termbrowser')}
        startIcon={<ArrowBackIcon fontSize='inherit' />}
        sx={{
          textTransform: 'none',
          whiteSpace: 'nowrap',
          minWidth: 'auto',
          // below sm the header has no room for the label, the tooltip carries it instead
          '& .MuiButton-startIcon': {
            marginLeft: 0,
            marginRight: { xs: 0, sm: '8px' },
          },
        }}
      >
        <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {t('common.classic_termbrowser')}
        </Box>
      </Button>
    </Tooltip>
  );
};

export default ClassicTermBrowserButton;
