import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItemButton, ListItemText, ListItemIcon, Divider} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DeleteIcon from '@mui/icons-material/Delete'

const RepoManagementList = ({ anchorEl, open, onClose, onClick, repo, id, isVersion }) => {
  const { t } = useTranslation()
  const url = isVersion ? repo.version_url : repo.url
  let editParams = isVersion ? {onClick: () => onClick('editVersion')} : {href: `#${url}edit`}
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
    >
      <ListItemButton id='addConcept' {...editParams} sx={{padding: '8px 12px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={t('common.edit')} />
      </ListItemButton>
      {
        !isVersion &&
          <>
            <ListItemButton id='addConcept' onClick={() => onClick('addConcept')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.add_concept')} />
            </ListItemButton>
            <ListItemButton id='addMapping' onClick={() => onClick('addMapping')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.add_mapping')} />
            </ListItemButton>
            <ListItemButton id='createVersion' onClick={() => onClick('createVersion')} sx={{padding: '8px 12px'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
                <VersionIcon />
              </ListItemIcon>
              <ListItemText primary={t('repo.create_version')} />
            </ListItemButton>
          </>
      }
      <Divider />
      <ListItemButton id='delete' onClick={() => onClick('delete')} sx={{padding: '8px 12px', color: 'error.main'}}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
          <DeleteIcon />
        </ListItemIcon>
        <ListItemText primary={isVersion ? t('repo.delete_repo_version') : t('repo.delete_repo')} />
      </ListItemButton>
    </Menu>
  )
}

export default RepoManagementList;
