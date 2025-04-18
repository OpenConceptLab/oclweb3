import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItemButton, ListItemText, ListItemIcon} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const RepoManagementList = ({ anchorEl, open, onClose, onClick, repo, id }) => {
  const { t } = useTranslation()
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
    >
      <ListItemButton id='addConcept' href={`#${repo.url}edit`} sx={{padding: '8px 12px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary={t('common.edit')} />
      </ListItemButton>
      <ListItemButton id='addConcept' onClick={() => onClick('addConcept')} sx={{padding: '8px 12px'}}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary={t('repo.add_concept')} />
      </ListItemButton>
    </Menu>
  )
}

export default RepoManagementList;
