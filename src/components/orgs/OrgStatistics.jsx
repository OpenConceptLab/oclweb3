import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom'
import PersonIcon from '@mui/icons-material/Face2';
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DateIcon from '@mui/icons-material/Today';
import { formatDate } from '../../common/utils'
import RepoIcon from '../repos/RepoIcon';
import MemberList from './MemberList'

const OrgStatistics = ({ org, members }) => {
  const { t } = useTranslation()
  const [membersOpen, setMembersOpen] = React.useState(false)
  const repos = org.public_sources + org.public_collections
  const history = useHistory()
  const onRepoStatsClick = () => history.push(org.url + 'repos')
  return (
    <div className='col-xs-12 padding-0' style={{margin: `0 0 24px 0`}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('common.statistics')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        <List sx={{color: 'secondary.main', p: 0}}>
          <ListItem disablePadding  href={`#${org.url}repos`} sx={{cursor: 'pointer'}} onClick={onRepoStatsClick}>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <RepoIcon noTooltip sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${repos} ${t('common.public').toLowerCase()} ${t('repo.repos').toLowerCase()}`}
            />
          </ListItem>
          <ListItem disablePadding sx={{marginTop: '8px', cursor: 'pointer'}} onClick={() => setMembersOpen(true)}>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <PersonIcon sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}}}
              primary={`${org.members} ${t('org.members').toLowerCase()}`}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <DateIcon sx={{color: 'default.light', width: '20px', height: '20px'}} />
            </ListItemIcon>
            <ListItemText
              sx={{color: 'default.light', '.MuiListItemText-primary': {fontSize: '12px'}, '.MuiListItemText-secondary': {fontSize: '12px'}}}
              primary={`${t('common.created_on')} ${formatDate(org.created_on)} ${t('common.by')} ${org.created_by}`}
              secondary={`${t('common.last_updated_on')} ${formatDate(org.updated_on)} ${t('common.by')} ${org.updated_by}`}
            />
          </ListItem>
        </List>
      </div>
      <MemberList members={members} open={Boolean(members?.length && membersOpen)} onClose={() => setMembersOpen(false)} />
    </div>
  )
}

export default OrgStatistics;
