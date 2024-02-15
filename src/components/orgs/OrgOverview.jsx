import React from 'react';
import { useTranslation } from 'react-i18next';
import {map, reject, filter, orderBy, chunk} from 'lodash';
import PersonIcon from '@mui/icons-material/Face2';
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Bookmark from '../common/Bookmark';
import About from '../common/About';
import UserIcon from '../users/UserIcon';
import RepoIcon from '../repos/RepoIcon';

const Member = ({ member }) => {
  return (
    <Tooltip key={member.url} title={member.name}>
      <IconButton href={`#${member.url}`}>
        <UserIcon user={member} sx={{width: '45px', height: '45px'}} />
      </IconButton>
    </Tooltip>
  )
}

const OrgBookmarks = ({ bookmarks }) => {
  const { t } = useTranslation()

  return bookmarks && bookmarks?.length ? (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold'}}>{t('bookmarks.pinned')}</Typography>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {
          map(bookmarks, (bookmark, i) => (
            <Bookmark
              key={bookmark.id} bookmark={bookmark} isLast={i === (bookmarks.length - 1)} />
          ))
        }
      </div>
    </div>
  ) : null
}

const OrgMembers = ({ members }) => {
  const { t } = useTranslation()
  return members && members?.length ? (
    <div className='col-xs-12 padding-0' style={{margin: '16px 0 24px 0'}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('org.members')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        {
          map(chunk([...orderBy(filter(members, 'logo_url'), 'name'), ...orderBy(reject(members, 'logo_url'), 'name')], 5), (_members, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
              {
                map(_members, member => (<Member key={member.url} member={member} />))
              }
            </div>
          ))
        }
      </div>
    </div>
  ) : null
}

const OrgStatistics = ({ org, marginTop }) => {
  const { t } = useTranslation()
  const repos = org.public_sources + org.public_collections
  return (
    <div className='col-xs-12 padding-0' style={{margin: `${marginTop} 0 24px 0`}}>
      <Typography component='h3' sx={{marginBottom: '16px', fontWeight: 'bold'}}>
        {t('org.statistics')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'column'}}>
        <List sx={{color: 'secondary.main', p: 0}}>
          <ListItem disablePadding>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <RepoIcon />
            </ListItemIcon>
            <ListItemText
              primary={`${repos} ${t('repo.repos').toLowerCase()}`}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary={`${org.members} ${t('org.members').toLowerCase()}`}
            />
          </ListItem>
        </List>
      </div>
    </div>
  )
}


const OrgOverview = ({ org, bookmarks, members }) => {
  const { t } = useTranslation()

  return (
    <div className='col-xs-12'>
      <div className='col-xs-9' style={{paddingLeft: 0, paddingRight: '16px'}}>
        <OrgBookmarks bookmarks={bookmarks} />
        <About text={org?.text} title={t('org.about_the_org')} />
      </div>
      <div className='col-xs-3'>
        <OrgMembers members={members} />
        <OrgStatistics org={org} marginTop={members?.length ? 0 : '16px'} />
      </div>
    </div>
  )
}

export default OrgOverview
