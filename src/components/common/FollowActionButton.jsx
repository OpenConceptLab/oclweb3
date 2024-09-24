import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from './Button';
import FollowIcon from '@mui/icons-material/VisibilityOutlined';
import FollowingIcon from './FollowingIcon';
import { getCurrentUser, refreshCurrentUserCache } from '../../common/utils'
import APIService from '../../services/APIService';

const Icon = ({isFollowing, ...rest}) => (
  isFollowing ? <FollowingIcon color='primary' {...rest} /> : <FollowIcon {...rest} />
)


const FollowIconButton = ({isFollowing, onClick, entity}) => {
  const { t } = useTranslation()

  return (
    <Tooltip title={`${isFollowing ? t('common.unfollow') : t('common.follow')} ${entity.id || entity.username || entity.name}`}>
      <IconButton sx={{color: 'surface.contrastText', mr: 1}} onClick={onClick}>
        <Icon isFollowing={isFollowing} fontSize='inherit' />
      </IconButton>
    </Tooltip>
  )
}


const FollowButton = ({ entity, isFollowing, onClick }) => {
  const { t } = useTranslation()

  return (
    <Button
      icon={<Icon isFollowing={isFollowing} sx={{fontSize: 'large'}} />}
      label={`${isFollowing ? t('common.following') : t('common.follow')} ${entity.name || entity.id}`}
      onClick={onClick}
      sx={{
        backgroundColor: isFollowing ? 'surface.s90' : 'transparent',
        fontWeight: 'bold',
        borderColor: isFollowing ? 'none' : 'surface.s90',
        border: isFollowing ? 'none' : '1px solid',
        '.MuiChip-icon': {
          color: isFollowing ? 'primary.main' : 'initial'
        }
      }}
    />
  )
}

const FollowActionButton = ({ entity, iconButton }) => {
  const [updated, setUpdated] = React.useState(0)
  const currentUser = getCurrentUser()
  const followingObject = currentUser?.following?.find(following => following?.object?.url === entity?.url)
  const isFollowing = Boolean(followingObject?.id)
  const onFollowToggle = () => {
    const service = APIService.users(currentUser.username).appendToUrl('following/')
    const callback = () => refreshCurrentUserCache(() => setUpdated(updated + 1))
    if(isFollowing)
      service.appendToUrl(`${followingObject.id}/`).delete().then(callback)
    else
      service.post({'follow': entity.url}).then(callback)
  }

  return currentUser?.url ? (
    iconButton ?
    <FollowIconButton isFollowing={isFollowing} onClick={onFollowToggle} entity={entity} /> :
    <FollowButton isFollowing={isFollowing} onClick={onFollowToggle} entity={entity} />
  ) : null
}

export default FollowActionButton;
