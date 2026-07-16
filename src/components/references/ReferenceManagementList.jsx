import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItem, ListItemButton, ListItemText, ListItemIcon, Divider, Tooltip} from '@mui/material'
import CopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const ReferenceManagementList = ({ anchorEl, open, onClose, id, onClick, canDelete=true, deleteDisabledReason='' }) => {
  const { t } = useTranslation()
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
        <ListItemButton id='copyExpression' onClick={() => onClick('copyExpression')} sx={{padding: '8px 12px'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
            <CopyIcon />
          </ListItemIcon>
          <ListItemText primary={t('reference.copy_expression')} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton id='copyExpression' onClick={() => onClick('copyURL')} sx={{padding: '8px 12px'}}>
          <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
            <CopyIcon />
          </ListItemIcon>
          <ListItemText primary={t('reference.copy_url')} />
        </ListItemButton>
      </ListItem>
      <Divider />
      <ListItem disablePadding>
        <Tooltip title={deleteDisabledReason}>
          <span style={{width: '100%'}}>
            <ListItemButton disabled={!canDelete} id='delete' onClick={() => onClick('delete')} sx={{padding: '8px 12px', color: 'error.main'}}>
              <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px', color: 'error.main'}}>
                <DeleteForeverIcon />
              </ListItemIcon>
              <ListItemText primary={t('common.delete_label')} />
            </ListItemButton>
          </span>
        </Tooltip>
      </ListItem>
    </Menu>
  )
}

export default ReferenceManagementList;
