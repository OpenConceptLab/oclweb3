import React from 'react';
import { useTranslation } from 'react-i18next'
import Chip from '@mui/material/Chip'
import merge from 'lodash/merge';
import { LIGHT_GRAY } from '../../common/constants'

const Retired = ({ style, size }) => {
  const { t } = useTranslation()
  const styles = merge({color: 'secondary.light', background: LIGHT_GRAY, borderRadius: '8px'}, (style || {}))
  return <Chip label={t('common.retired')} size={size} sx={styles} />
}

export default Retired;
