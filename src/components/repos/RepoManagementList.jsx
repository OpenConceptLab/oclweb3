import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItemButton, ListItemText, ListItemIcon, Divider, Box} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DeleteIcon from '@mui/icons-material/Delete'
import ReleaseIcon from '@mui/icons-material/NewReleases';
import RepeatIcon from '@mui/icons-material/Repeat';
import CopyIcon from '@mui/icons-material/ContentCopy';
import GAService from '../../services/GAService';
import PinIcon from '../common/PinIcon';
import { LockableMenuItem, useNoticeLocks } from '../common/NoticeLocks';

const RepoManagementList = ({ anchorEl, open, onClose, onClick, repo, id, isVersion, hasAccess, createSimilarHref, pin }) => {
  const { t } = useTranslation()
  // An edit action the repository's notices lock is shown disabled, with the notice's reason (NoticeLocks)
  const lockFor = useNoticeLocks()
  const url = isVersion ? repo.version_url : repo.url
  let editParams = isVersion ? {onClick: () => onClick('editVersion')} : {href: `${url}edit`}
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
    >
      {
        hasAccess &&
          <LockableMenuItem lock={lockFor(isVersion ? 'editVersion' : 'editRepo')} id='addConcept' {...editParams} sx={{padding: '8px 12px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={isVersion ? t('repo.edit_version') : t('common.edit')} />
          </LockableMenuItem>
      }
      {
        hasAccess && (
          isVersion ?
            <LockableMenuItem lock={lockFor('releaseVersion')} id='addConcept' onClick={() => onClick('release')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <ReleaseIcon color={repo.released ? 'gray' : 'primary'} />
              </ListItemIcon>
              <ListItemText primary={repo.released ? t('repo.unrelease_version') : t('repo.release_version')} />
            </LockableMenuItem> :
          <Box>
            <LockableMenuItem lock={lockFor('addConcept')} id='addConcept' onClick={() => onClick('addConcept')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.add_concept')} />
            </LockableMenuItem>
            <LockableMenuItem lock={lockFor('addMapping')} id='addMapping' onClick={() => onClick('addMapping')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.add_mapping')} />
            </LockableMenuItem>
            <LockableMenuItem lock={lockFor('createVersion')} id='createVersion' onClick={() => onClick('createVersion')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <VersionIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.create_version')} />
            </LockableMenuItem>
          </Box>
        )
      }
      {
        !isVersion &&
          <ListItemButton id='copyURL' onClick={() => onClick('copyURL')} sx={{padding: '8px 12px'}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <CopyIcon />
            </ListItemIcon>
            <ListItemText primary={t('common.copy_api_url')} />
          </ListItemButton>
      }
      {
        Boolean(createSimilarHref) &&
          <ListItemButton id='createSimilar' href={createSimilarHref} onClick={() => {
            GAService.recordActionEvent('Create Similar', 'create_similar_repo', repo.short_code || repo.id, { url: repo.url })
            onClose()
          }} sx={{padding: '8px 12px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <RepeatIcon />
            </ListItemIcon>
            <ListItemText primary={t('repo.create_similar')} />
          </ListItemButton>
      }
      {
        Boolean(pin) &&
          <ListItemButton id='pin' onClick={() => onClick('pin')} sx={{padding: '8px 12px'}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <PinIcon pinned={pin.pinned} />
            </ListItemIcon>
            <ListItemText primary={t(pin.pinned ? 'bookmarks.unpin_from_owner_overview' : 'bookmarks.pin_to_owner_overview', {owner: pin.owner, interpolation: {escapeValue: false}})} />
          </ListItemButton>
      }
      {
        hasAccess &&
          <Box>
            <Divider />
            <LockableMenuItem lock={lockFor(isVersion ? 'deleteVersion' : 'deleteRepo')} id='delete' onClick={() => onClick('delete')} sx={{padding: '8px 12px', color: 'error.main'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary={isVersion ? t('repo.delete_repo_version') : t('repo.delete_repo')} />
            </LockableMenuItem>
          </Box>
      }
    </Menu>
  )
}

export default RepoManagementList;
