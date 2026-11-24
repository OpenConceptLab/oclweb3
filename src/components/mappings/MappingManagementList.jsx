import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItem, ListItemText, ListItemIcon, Divider} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import RetireIcon from '@mui/icons-material/Delete';
import UnretireIcon from '@mui/icons-material/RestoreFromTrash';
import { LockableMenuItem, useNoticeLocks } from '../common/NoticeLocks';

const MappingManagementList = ({ anchorEl, open, onClose, id, onClick, mapping }) => {
  const { t } = useTranslation()
  const lockFor = useNoticeLocks()
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{
        list: {
          'aria-labelledby': id,
          role: 'listbox',
        },
      }}
      sx={{'.MuiMenu-list': {padding: 0, minWidth: '200px'}}}
    >
      <ListItem disablePadding>
        <LockableMenuItem lock={lockFor('editMapping')} id='editMapping' onClick={() => onClick('editMapping')} sx={{padding: '8px 12px'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary={t('mapping.edit_mapping')} />
        </LockableMenuItem>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <LockableMenuItem lock={lockFor('retireMapping')} id='retireMapping' onClick={() => onClick('retireMapping')} sx={{padding: '8px 12px', color: 'error.main'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
            {mapping?.retired ? <UnretireIcon /> : <RetireIcon />}
          </ListItemIcon>
          <ListItemText primary={mapping?.retired ? t('common.unretire') : t('common.retire')} />
        </LockableMenuItem>
      </ListItem>
    </Menu>
  )
}

export default MappingManagementList;
