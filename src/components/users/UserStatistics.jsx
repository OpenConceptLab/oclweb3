import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import RepoIcon from '../repos/RepoIcon';
import OrgIcon from '../orgs/OrgIcon'
import About from '../common/About';

const UserStatistics = ({ user }) => {
  const { t } = useTranslation()
  const repos = user.public_sources + user.public_collections
  const history = useHistory()
  const onRepoStatsClick = () => history.push(user.url + 'repos')
  return (
    <div className='col-xs-12 padding-0' style={{margin: `0 0 24px 0`}}>
      {
        user?.bio &&
          <>
            <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
              {t('common.about')}
            </Typography>
            <About text={user.bio} style={{marginTop: 0, marginBottom: '24px'}} />
          </>

      }
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('common.summary')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        <List sx={{color: 'secondary.main', p: 0}}>
          <ListItem disablePadding href={`#${user.url}repos`} sx={{cursor: 'pointer'}} onClick={onRepoStatsClick}>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <RepoIcon sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${repos} ${t('common.public').toLowerCase()} ${t('repo.repos').toLowerCase()}`}
            />
          </ListItem>
          <ListItem disablePadding >
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <OrgIcon strict noLink sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${user.orgs} ${t('common.subscribed').toLowerCase()} ${t('org.orgs').toLowerCase()}`}
            />
          </ListItem>
        </List>
      </div>
    </div>
  )
}

export default UserStatistics;
