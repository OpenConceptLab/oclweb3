import React from 'react'
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import UserIcon from '@mui/icons-material/Face2';
import OrgIcon from '../orgs/OrgIcon';
import RepoIcon from '../repos/RepoIcon';
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import has from 'lodash/has'
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import APIService from '../../services/APIService'

const TooltipTitle = ({ user }) => {
  const [entity, setEntity] = React.useState(user || {})
  const shouldRefetch = () => Boolean(user?.url && !has(entity, 'public_sources'))
  const fetchUser = () => {
    if(shouldRefetch())
      APIService.new().overrideURL(user.url).get().then(response => setEntity(response.data))
    else
      setEntity(user)
  }

  React.useEffect(() => {
    fetchUser()
  }, [user?.url])

  const { t } = useTranslation()
  const history = useHistory()

  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {
          entity?.logo_url ?
            <img src={entity.logo_url} style={{width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover'}} /> :
          <Avatar sx={{width: '36px', height: '36px'}}>
            <UserIcon sx={{width: '24px', height: '24px'}} />
          </Avatar>
        }
        <FollowActionButton iconButton entity={entity} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(entity?.url)}>
          <b>{entity?.name}</b>
        </span>
        <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(entity?.url)}>
          {entity?.username}
        </span>
      </div>
      {
        Boolean(entity?.company) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {entity.company}
          </div>
      }
      <div style={{width: '100%', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', textAlign: 'left'}} className='ellipsis-text-3'>
        {
          entity?.orgs >= 0 ?
            <span style={{fontSize: '12px', display: 'flex', alignItems: 'center'}} className='ellipsis-text-3'>
              <OrgIcon noLink strict sx={{marginRight: '4px', fontSize: '14px'}} size='small' noTooltip /> {entity.orgs} {t('org.orgs').toLowerCase()}
            </span> :
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '33%' }} />
        }
        {
          entity?.public_sources >= 0 ?
            <span style={{fontSize: '12px', display: 'flex', alignItems: 'center', marginLeft: entity.orgs >= 0 ? '8px' : 0}} className='ellipsis-text-3'>
              <RepoIcon sx={{marginRight: '4px', fontSize: '14px'}} size='small' noTooltip /> {entity.public_sources + entity.public_collections} {t('repo.repos').toLowerCase()}
            </span> :
          <Skeleton variant="text" sx={{ fontSize: '1rem', width: '33%', marginLeft: '8px' }} />
        }
      </div>
    </React.Fragment>
  )
}


const UserTooltip = ({ user, children, spanStyle  }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle user={user} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>
  )
}

export default UserTooltip;
