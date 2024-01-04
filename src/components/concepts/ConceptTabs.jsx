import React from 'react';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const TAB_STYLES = {textTransform: 'none'}
const ConceptTabs = ({ tab, onTabChange }) => {
  const { t } = useTranslation()
  return (
    <Tabs
      value={tab}
      onChange={onTabChange}
      indicatorColor="primary"
      variant="fullWidth"
      aria-label="concept tabs"
      sx={{width: '100%', borderBottom: '1px solid', borderColor: 'surface.n90'}}
    >
      <Tab value="metadata" label={t('common.metadata')} sx={TAB_STYLES} />
      <Tab value="history" label={t('concept.history')} sx={TAB_STYLES} />
    </Tabs>
  )
}

export default ConceptTabs
