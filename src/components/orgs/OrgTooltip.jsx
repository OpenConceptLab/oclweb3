import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom';
import UserIcon from '@mui/icons-material/Face2';
import OrganizationIcon from '@mui/icons-material/AccountBalance';
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'
import has from 'lodash/has'
import HTMLTooltip from '../common/HTMLTooltip'
import FollowActionButton from '../common/FollowActionButton'
import RepoIcon from '../repos/RepoIcon';
import APIService from '../../services/APIService'

const TooltipTitle = ({ org }) => {
  const [entity, setEntity] = React.useState(org || {})
  const shouldRefetch = () => Boolean(org?.url && !has(entity, 'public_sources'))
  const fetchEntity = () => {
    if(shouldRefetch())
      APIService.new().overrideURL(org.url).get().then(response => setEntity(response.data))
    else
      setEntity(org)
  }

  React.useEffect(() => {
    fetchEntity()
  }, [org?.url])

  const history = useHistory()
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        {
          entity?.logo_url ?
            <img src={entity.logo_url} style={{width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover'}} /> :
            <Avatar sx={{width: '36px', height: '36px'}}>
              <OrganizationIcon sx={{width: '24px', height: '24px'}}  />
            </Avatar>
        }
        <FollowActionButton iconButton entity={entity} sx={{mr: 0, ml: 1.5}} size='small' />
      </div>
      <div style={{width: '100%', fontSize: '14px', marginTop: '6px'}}>
        {
          entity?.name &&
            <span style={{color: '#000', cursor: 'pointer'}} onClick={() => history.push(entity?.url)}>
              <b>{entity?.name}</b>
            </span>
        }
        <span style={{marginLeft: '8px', cursor: 'pointer'}} onClick={() => history.push(entity?.url)}>
          {entity?.id}
        </span>
      </div>
      {
        Boolean(entity?.description) &&
          <div style={{width: '100%', fontSize: '12px', marginTop: '4px'}} className='ellipsis-text-3'>
            {entity.description}
          </div>
      }
      <div style={{width: '100%', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', textAlign: 'left'}} className='ellipsis-text-3'>
        {
          entity?.members >= 0 ?
            <span style={{fontSize: '12px', display: 'flex', alignItems: 'center'}} className='ellipsis-text-3'>
              <UserIcon sx={{marginRight: '4px', fontSize: '14px'}} size='small' />
              <span style={{marginTop: '2px'}}>{entity.members} {t('org.members').toLowerCase()}</span>
            </span> :
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        }
        {
          entity?.public_sources >= 0 ?
            <span style={{fontSize: '12px', display: 'flex', alignItems: 'center', marginLeft: entity.members >= 0 ? '8px' : 0}} className='ellipsis-text-3'>
              <RepoIcon sx={{marginRight: '4px', fontSize: '14px'}} size='small' noTooltip />
              <span style={{marginTop: '2px'}}>{entity.public_sources + entity.public_collections} {t('repo.repos').toLowerCase()}</span>
            </span> :
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        }
      </div>
    </React.Fragment>
  )
}

const OrgTooltip = ({ org, children, spanStyle }) => {
  return (
    <HTMLTooltip
      title={
        <React.Fragment>
          <TooltipTitle org={org} />
        </React.Fragment>
      }
    >
      <span style={{display: 'flex', ...spanStyle}}>
        {children}
      </span>
    </HTMLTooltip>
  )
}

export default OrgTooltip;
