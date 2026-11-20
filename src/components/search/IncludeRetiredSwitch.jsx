import React from 'react';
import { useTranslation } from 'react-i18next'
import Chip from '@mui/material/Chip';
import SelectedIcon from '@mui/icons-material/Done';

// The results toolbar's "Include Retired" switch (see retiredSwitch.js). It looks like the
// "Include Retired" chip on a concept's associations (concepts/Associations): a tick and a filled
// primary.90 background when on, outlined when off. The count shows only once the API has given
// one; it isn't shown as 0 when the API left it out.
const IncludeRetiredSwitch = ({ checked, count, onChange }) => {
  const { t } = useTranslation()
  return (
    <Chip
      label={Number.isFinite(count) ? t('search.include_retired_count', {retired: count.toLocaleString()}) : t('search.include_retired')}
      icon={checked ? <SelectedIcon fontSize='small' /> : undefined}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      variant={checked ? 'filled' : 'outlined'}
      sx={[{textTransform: 'none', flexShrink: 0, marginRight: '8px'}, checked ? {backgroundColor: 'primary.90'} : {backgroundColor: null}]}
    />
  )
}

export default IncludeRetiredSwitch
