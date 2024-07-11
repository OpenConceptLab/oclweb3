import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Face2';
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import RepoIcon from '../repos/RepoIcon';

const OrgStatistics = ({ org }) => {
  const { t } = useTranslation()
  const repos = org.public_sources + org.public_collections
  const history = useHistory()
  const onRepoStatsClick = () => history.push(org.url + 'repos')
  return (
    <div className='col-xs-12 padding-0' style={{margin: `0 0 24px 0`}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('org.statistics')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        <List sx={{color: 'secondary.main', p: 0}}>
          <ListItem disablePadding  href={`#${org.url}repos`} sx={{cursor: 'pointer'}} onClick={onRepoStatsClick}>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <RepoIcon sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${repos} ${t('common.public').toLowerCase()} ${t('repo.repos').toLowerCase()}`}
            />
          </ListItem>
          <ListItem disablePadding sx={{marginTop: '8px'}}>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <PersonIcon sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${org.members} ${t('org.members').toLowerCase()}`}
            />
          </ListItem>
        </List>
      </div>
    </div>
  )
}

export default OrgStatistics;
