import React from 'react';
import { useTranslation } from 'react-i18next'
import { Menu, ListItemButton, ListItemText, ListItemIcon, Divider} from '@mui/material'
import ImportIcon from '@mui/icons-material/Publish';
import { getCurrentUser } from '../../common/utils';
import OrgIcon from '../orgs/OrgIcon'
import RepoIcon from '../repos/RepoIcon'

const ITEM_SX = {padding: '8px 12px', '&:hover': {color: 'inherit'}, '&:focus': {outline: 'none', textDecoration: 'none', color: 'inherit'}}

const AddMenuList = ({ anchorEl, open, onClose }) => {
  const { t } = useTranslation()
  const user = getCurrentUser()
  return (
    <Menu
      id='user-add-menu-list'
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94', minWidth: '200px'}}}
    >
      <ListItemButton id='addOrg' href='/orgs/new' sx={ITEM_SX} onClick={onClose}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <OrgIcon noTooltip noLink strict />
        </ListItemIcon>
        <ListItemText primary={t('org.org')} />
      </ListItemButton>
      <ListItemButton id='addRepo' href={`${user?.url}repos/new`} sx={ITEM_SX} onClick={onClose}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <RepoIcon noTooltip />
        </ListItemIcon>
        <ListItemText primary={t('repo.repo')} />
      </ListItemButton>
      <Divider />
      <ListItemButton id='bulkImport' href='/imports' sx={ITEM_SX} onClick={onClose}>
        <ListItemIcon sx={{minWidth: 'auto', marginRight: '12px'}}>
          <ImportIcon />
        </ListItemIcon>
        <ListItemText primary={t('import.bulk_import')} />
      </ListItemButton>
    </Menu>
  )
}
export default AddMenuList;