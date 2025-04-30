import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import RetireIcon from '@mui/icons-material/Delete';
import UnretireIcon from '@mui/icons-material/RestoreFromTrash';

const MappingManagementList = ({ anchorEl, open, onClose, id, onClick, mapping }) => {
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
        <ListItemButton id='editMapping' onClick={() => onClick('editMapping')} sx={{padding: '8px 12px'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={t('mapping.edit_mapping')} />
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <ListItemButton id='retireMapping' onClick={() => onClick('retireMapping')} sx={{padding: '8px 12px', color: 'error.main'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
            {mapping?.retired ? <UnretireIcon /> : <RetireIcon />}
          </ListItemIcon>
          <ListItemText primary={mapping?.retired ? t('common.unretire') : t('common.retire')} />
        </ListItemButton>
      </ListItem>
    </Menu>
  )
}

export default MappingManagementList;
