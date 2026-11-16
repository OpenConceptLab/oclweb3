import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { toTBv2URL } from '../../common/utils';
import ClassicOCLLogo from '../common/ClassicOCLLogo';

// TBv2's own primary color, so the chip reads as a way into TBv2 (TBv2's "View in TBv3" chip uses TBv3's)
const V2_PRIMARY = 'rgb(51, 115, 170)';

const ClassicTermBrowserButton = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const href = toTBv2URL(location.pathname);

  if(!href)
    return null;

  return (
    <Tooltip title={t('common.back_to_classic_termbrowser')} arrow>
      <Chip
        variant='outlined'
        clickable
        component='a'
        href={href}
        icon={<ClassicOCLLogo />}
        label={t('common.classic_termbrowser')}
        // The header's right column can't fit the chip beside + and the account button on a phone, nor its
        // label below md, where the tooltip carries it instead.
        sx={{
          display: {xs: 'none', sm: 'inline-flex'},
          marginRight: '8px',
          paddingLeft: {sm: '6px', md: '8px'},
          verticalAlign: 'middle',
          color: V2_PRIMARY,
          borderColor: V2_PRIMARY,
          '.MuiChip-icon': {
            marginRight: {sm: '6px', md: '-6px'}
          },
          '.MuiChip-label': {
            display: {sm: 'none', md: 'block'},
            paddingLeft: '6px',
            paddingRight: '8px'
          }
        }}
      />
    </Tooltip>
  );
};

export default ClassicTermBrowserButton;
