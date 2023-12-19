import React from 'react';
import { useTranslation } from 'react-i18next'
import Chip from '@mui/material/Chip'
import merge from 'lodash/merge';
import { SECONDARY, LIGHT_GRAY } from '../../common/constants'

const Retired = ({ style, size }) => {
  const { t } = useTranslation()
  const styles = merge({color: SECONDARY, background: LIGHT_GRAY}, (style || {}))
  return <Chip label={t('common.retired')} size={size} style={styles} />
}

export default Retired;
