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


const FollowIconButton = ({isFollowing, onClick, entity, size, sx}) => {
  const { t } = useTranslation()

  const getTitle = () => {
    return entity?.short_code || entity?.id || entity?.username || entity?.name
  }

  return (
    <Tooltip title={`${isFollowing ? t('common.unfollow') : t('common.follow')} ${getTitle()}`}>
      <IconButton sx={{color: 'surface.contrastText', mr: 1, ...sx}} onClick={onClick} size={size}>
        <Icon isFollowing={isFollowing} fontSize='inherit' />
      </IconButton>
    </Tooltip>
  )
}


const FollowButton = ({ entity, isFollowing, onClick, sx, size }) => {
  const { t } = useTranslation()

  return (
    <Button
      size={size}
      icon={<Icon isFollowing={isFollowing} sx={{fontSize: 'large'}} />}
      label={`${isFollowing ? t('common.following') : t('common.follow')} ${entity.name || entity.id}`}
      onClick={onClick}
      sx={[{
        fontWeight: 'bold',
        ...sx
      }, isFollowing ? {
        backgroundColor: 'surface.s90'
      } : {
        backgroundColor: 'transparent'
      }, isFollowing ? {
        borderColor: 'none'
      } : {
        borderColor: 'surface.s90'
      }, isFollowing ? {
        border: 'none'
      } : {
        border: '1px solid'
      }, isFollowing ? {
        '.MuiChip-icon': {
          color: 'primary.main'
        }
      } : {
        '.MuiChip-icon': {
          color: 'initial'
        }
      }]}
    />
  );
}

const FollowActionButton = ({ entity, iconButton, sx, size}) => {
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
      <FollowIconButton isFollowing={isFollowing} onClick={onFollowToggle} entity={entity} sx={sx} size={size} /> :
    <FollowButton isFollowing={isFollowing} onClick={onFollowToggle} entity={entity} sx={sx} size={size} />
  ) : null
}
export default FollowActionButton;