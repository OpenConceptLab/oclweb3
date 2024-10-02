import React from 'react';
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import CompanyIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import { formatWebsiteLink, formatDate, canEditUser, sortOrgs, copyToClipboard, getCurrentUser } from '../../common/utils'
import UserIcon from './UserIcon';
import OrgChip from '../orgs/OrgChip'
import Link from '../common/Link'
import { OperationsContext } from '../app/LayoutContext';
import APIService from '../../services/APIService';
import FollowActionButton from '../common/FollowActionButton'


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
            fontSize: '12px',
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
  const params = useParams()
  const [apiToken, setApiToken] = React.useState(undefined)
  const { setAlert } = React.useContext(OperationsContext);
  const iconStyle = {fontSize: '20px', color: 'secondary.main'}
  const userOrgs = sortOrgs(user?.subscribed_orgs || [])
  const onCopyToken = () => {
    copyToClipboard(apiToken)
    setAlert({message: t('user.copy_token_success'), severity: 'success', duration: 2000})
  }
  const canEdit = canEditUser(params?.user)

  const fetchAPIToken = () => {
    if(canEdit && !apiToken)
      APIService.users().appendToUrl('api-token/').get().then(response => setApiToken(response?.data?.token))
  }

  React.useEffect(() => {
    fetchAPIToken()
  }, [params.user])

  const currentUser = getCurrentUser()
  const isCurrentUser = Boolean(currentUser?.username && currentUser?.username == params.user)

  return (
    <React.Fragment>
      <UserIcon noTooltip user={user} color='primary' sx={{color: 'primary', fontSize: '100px'}} logoClassName='user-img-medium' />
      <Typography component='h2' sx={{marginTop: '16px', color: 'surface.dark', fontWeight: 'bold', fontSize: '24px', letterSpacing: 'normal'}}>
        {user?.name}
      </Typography>
      <Typography component='h3' sx={{color: 'surface.light', display: 'flex', alignItems: 'center'}}>
        {user?.username}
      </Typography>
      <List sx={{color: 'secondary.main', marginTop: '8px'}}>
        <UserProperty icon={<LocationIcon sx={iconStyle} />} value={user?.location} />
        <UserProperty icon={<CompanyIcon sx={iconStyle} />} value={user?.company} />
        <UserProperty icon={<EmailIcon sx={iconStyle} />} value={user?.email} />
        <UserProperty icon={<LinkIcon sx={iconStyle} />} value={user?.website} label={formatWebsiteLink(user?.website, {color: 'inherit'})} />
      </List>
      {
        Boolean(currentUser?.username && !isCurrentUser && user?.name) &&
          <div style={{marginTop: '8px', marginBottom: '16px'}}>
            <FollowActionButton entity={user} />
          </div>

      }
      <Divider sx={{marginTop: '8px'}} />
      {
        userOrgs.length > 0 &&
          <React.Fragment>
            <Typography component='h2' sx={{marginTop: '16px', fontWeight: 'bold'}}>
              {t('org.orgs')}
              <div className='col-xs-12 padding-0' style={{marginTop: '8px', maxHeight: '300px', overflow: 'auto'}}>
                {
                  userOrgs.map(org => (
                    <OrgChip hideType key={org?.id} org={org} sx={{margin: '4px'}} />
                  ))
                }
              </div>
            </Typography>
            <Divider sx={{marginTop: '16px', width: '100%', display: 'inline-block'}} />
          </React.Fragment>
      }
      <Typography component='h1' sx={{color: 'surface.light', marginTop: '16px', fontSize: '12px'}}>
        Joined {formatDate(user?.date_joined)}
      </Typography>
      {
        canEdit &&
          <div style={{paddingLeft: '12px'}}>
            <Link
              label={t('user.edit_my_profile')}
              href={`#${user.url}edit`}
              sx={{fontSize: '12px', fontWeight: 'bold', marginTop: '16px'}}
              startIcon={<PersonOutlineOutlinedIcon fontSize='inherit' />}
            />
            <br />
            {
              apiToken &&
                <Link
                  label={t('user.copy_api_token')}
                  onClick={onCopyToken}
                  sx={{fontSize: '12px', fontWeight: 'bold', marginTop: '8px'}}
                  startIcon={<CopyIcon fontSize='inherit' />}
                />
            }
          </div>
      }
    </React.Fragment>
  )
}

export default UserProfile;
