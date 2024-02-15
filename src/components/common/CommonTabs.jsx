import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const RepoTabs = ({TABS, ...rest}) => {
  return (
    <Tabs
      indicatorColor="primary"
      variant="fullWidth"
      aria-label="repo full width tabs"
      sx={{backgroundColor: 'surface.main', width: '100%', borderTop: '0.3px solid', borderBottom: '0.3px solid', borderColor: 'surface.n90'}}
      {...rest}
    >
      {
        TABS.map(resource => (
          <Tab
            key={resource.key}
            className='tab-anchor'
            value={resource.key}
            label={resource.label}
          sx={{color: 'surface.contrastText', fontWeight: 'bold'}}
          />
        ))
      }
    </Tabs>
  )
}

export default RepoTabs
