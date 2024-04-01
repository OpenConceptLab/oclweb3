import React from 'react';
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import URLRegistryIcon from '../url-registry/URLRegistryIcon'

const UserSettingOptions = () => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <Typography component="div" sx={{padding: '16px 0', fontSize: '18px', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.15px', color: 'secondary.main'}}>
        {t('common.settings')}
      </Typography>
      <List>
        <ListItemButton sx={{p: 2, borderRadius: '100px'}} selected>
          <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
            <URLRegistryIcon />
          </ListItemIcon>
          <ListItemText sx={{'.MuiListItemText-primary': {fontWeight: 'bold'}}} primary={t('url_registry.url_registry')} />
        </ListItemButton>
      </List>
    </React.Fragment>
  )
}

export default UserSettingOptions;
