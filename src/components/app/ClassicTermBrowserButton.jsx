import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { toV2URL } from '../../common/utils';
import ClassicOCLLogo from '../common/ClassicOCLLogo';

const V2_PRIMARY = 'rgb(51, 115, 170)';

const ClassicTermBrowserButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const href = toV2URL(location.pathname + (location.search || ''));

  return (
    <Tooltip title={t('common.back_to_classic_termbrowser')} arrow>
      <Chip
        size='medium'
        variant='outlined'
        clickable
        component='a'
        href={href}
        aria-label={t('common.back_to_classic_termbrowser')}
        icon={<ClassicOCLLogo />}
        label={t('common.classic_termbrowser')}
        sx={{
          marginRight: '8px',
          paddingLeft: '8px',
          verticalAlign: 'middle',
          maxWidth: {xs: '150px', sm: 'none'},
          color: V2_PRIMARY,
          borderColor: V2_PRIMARY,
          '.MuiChip-label': {
            paddingLeft: '6px',
            paddingRight: '8px'
          }
        }}
      />
    </Tooltip>
  );
};

export default ClassicTermBrowserButton;
