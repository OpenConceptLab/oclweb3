import React from 'react';
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import { filter, reject, orderBy } from 'lodash'
import { formatWebsiteLink, formatDate } from '../../common/utils'
import UserIcon from './UserIcon';
import OrgIcon from '../orgs/OrgIcon';


const UserProperty = ({icon, value, label}) => {
  return value ? (
    <ListItem disablePadding>
      <ListItemIcon sx={{minWidth: 0, marginRight: '8px'}}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label || value}
        sx={{
          '.MuiTypography-root': {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
        }}}
      />
    </ListItem>
  ) : null
}


const UserProfile = ({ user }) => {
  const { t } = useTranslation()
  const iconStyle = {fontSize: '24px', color: 'secondary.main'}
  return (
    <React.Fragment>
      <UserIcon user={user} color='primary' sx={{color: 'primary', fontSize: '100px'}} logoClassName='user-img-medium' />
      <Typography component='h2' sx={{marginTop: '16px', color: 'surface.dark', fontWeight: 'bold', fontSize: '2em'}}>
        {user?.name}
      </Typography>
      <Typography component='h3' sx={{color: 'surface.light'}}>
        {user?.username}
      </Typography>
      <List sx={{color: 'secondary.main', marginTop: '8px'}}>
        <UserProperty icon={<LocationIcon sx={iconStyle} />} value={user?.location} />
        <UserProperty icon={<EmailIcon sx={iconStyle} />} value={user?.email} />
        <UserProperty icon={<LinkIcon sx={iconStyle} />} value={user?.website} label={formatWebsiteLink(user?.website, {color: 'inherit'})} />
      </List>
      <Divider sx={{marginTop: '8px'}} />
      {
        user?.subscribed_orgs?.length > 0 &&
          <React.Fragment>
            <Typography component='h2' sx={{marginTop: '16px', fontWeight: 'bold'}}>
              {t('org.orgs')}
              <div className='col-xs-12 padding-0' style={{marginTop: '8px', maxHeight: '300px', overflow: 'auto'}}>
                {
                  [...orderBy(filter(user.subscribed_orgs, 'logo_url'), 'name'), ...orderBy(reject(user.subscribed_orgs, 'logo_url'), 'name')].map(org => (
                    <span key={org.url} style={{margin: '4px', display: 'inline-block'}}>
                      <OrgIcon org={org} />
                    </span>
                  ))
                }
              </div>
            </Typography>
            <Divider sx={{marginTop: '16px', width: '100%', display: 'inline-block'}} />
          </React.Fragment>
      }
      <Typography component='h1' sx={{color: 'surface.light', marginTop: '16px', fontSize: '14px'}}>
        Joined {formatDate(user?.date_joined)}
      </Typography>
    </React.Fragment>
  )
}

export default UserProfile;
