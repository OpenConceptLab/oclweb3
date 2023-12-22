import React from 'react';
import { useTranslation } from 'react-i18next'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const TAB_STYLES = {textTransform: 'none'}
const RepoTabs = ({ tab, onTabChange }) => {
  const { t } = useTranslation()
  return (
    <Tabs
      value={tab}
      onChange={onTabChange}
      indicatorColor="primary"
      variant="fullWidth"
      aria-label="repo full width tabs"
      sx={{backgroundColor: 'surface.main', width: '100%', borderTop: '0.3px solid', borderBottom: '0.3px solid', borderColor: 'surface.n90'}}
    >
      <Tab value="concepts" label={t('concept.concepts')} sx={TAB_STYLES} />
      <Tab value="mappings" label={t('mapping.mappings')} sx={TAB_STYLES} />
      <Tab value="versions" label={t('common.versions')} sx={TAB_STYLES} />
      <Tab value="summary" label={t('common.summary')} sx={TAB_STYLES} />
      <Tab value="about" label={t('common.about')} sx={TAB_STYLES} />
    </Tabs>
  )
}

export default RepoTabs
