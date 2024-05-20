import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItem, ListItemButton, ListItemText, ListItemIcon} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';

const RepoManagementList = ({ anchorEl, open, onClose, id, onClick }) => {
  const { t } = useTranslation()
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{
        'aria-labelledby': id,
        role: 'listbox',
      }}
    sx={{'.MuiMenu-list': {padding: 0, minWidth: '200px'}}}
    >
      <ListItem disablePadding>
        <ListItemButton id='addConcept' onClick={() => onClick('addConcept')} sx={{padding: '8px 12px'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary={t('repo.add_concept')} />
        </ListItemButton>
      </ListItem>
    </Menu>
  )
}

export default RepoManagementList;
