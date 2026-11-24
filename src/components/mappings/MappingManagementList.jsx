import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import RetireIcon from '@mui/icons-material/Delete';
import UnretireIcon from '@mui/icons-material/RestoreFromTrash';
import { LockMark, LockTooltip, useNoticeLocks } from '../common/NoticeLocks';

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
        <LockTooltip title={lockFor('editMapping')}>
          <ListItemButton id='editMapping' onClick={() => onClick('editMapping')} disabled={Boolean(lockFor('editMapping'))} sx={{padding: '8px 12px'}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary={t('mapping.edit_mapping')} />
            {lockFor('editMapping') && <LockMark />}
          </ListItemButton>
        </LockTooltip>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <LockTooltip title={lockFor('retireMapping')}>
          <ListItemButton id='retireMapping' onClick={() => onClick('retireMapping')} disabled={Boolean(lockFor('retireMapping'))} sx={{padding: '8px 12px', color: 'error.main'}}>
            <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
              {mapping?.retired ? <UnretireIcon /> : <RetireIcon />}
            </ListItemIcon>
            <ListItemText primary={mapping?.retired ? t('common.unretire') : t('common.retire')} />
            {lockFor('retireMapping') && <LockMark />}
          </ListItemButton>
        </LockTooltip>
      </ListItem>
    </Menu>
  )
}

export default MappingManagementList;
