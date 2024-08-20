import React from 'react';
import { useTranslation } from 'react-i18next'
import Chip from '@mui/material/Chip'
import merge from 'lodash/merge';

const Retired = ({ style, size }) => {
  const { t } = useTranslation()
  const styles = merge({color: 'secondary.light', backgroundColor: 'surface.n90', borderRadius: '8px'}, (style || {}))
  return <Chip label={t('common.retired')} size={size} sx={styles} />
}

export default Retired;
