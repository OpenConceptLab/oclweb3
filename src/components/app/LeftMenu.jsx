import React from 'react';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom';
import Typography from '@mui/material/Typography'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderOpenIcon from '@mui/icons-material/FolderOutlined';
import Divider from '@mui/material/Divider';
import { getCurrentUser, refreshCurrentUserCache, getCurrentUserOrgs } from '../../common/utils';
import Drawer from '../common/Drawer';
import OrgIcon from '../orgs/OrgIcon';
import { getIcon } from '../common/Bookmark'


const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const LeftMenu = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const user = getCurrentUser()

  const [orgs, setOrgs] = React.useState(getCurrentUserOrgs())
  const [bookmarks, setBookmarks] = React.useState(user?.pins || [])

  const fetchData = () => {
    refreshCurrentUserCache(response => {
      setOrgs(getCurrentUserOrgs())
      setBookmarks(response?.data?.pins || [])
    })
  }

  React.useEffect(() => {
    if(isOpen && getCurrentUser()?.url)
      fetchData()
  }, [isOpen && user?.url])

  return (
    <Drawer isOpen={isOpen} onClose={onClose} anchor='left' bgColor='default.main'>
      <DrawerHeader>
        <Typography component="div" sx={{color: 'secondary.main', fontWeight: 'bold', minHeight: '56px !important'}}>
          {t('common.quick_links')}
        </Typography>
      </DrawerHeader>
      <List sx={{p: 0}}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={onClose}
            href="/#/"
            className='no-anchor-styles'
            selected={location.pathname === '/'}
            sx={{
              minHeight: 56,
              justifyContent: 'initial',
              px: 2,
              borderRadius: '100px'
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 1.75,
                justifyContent: 'center',
              }}
            >
              <DashboardIcon color={location.pathname === '/' ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary={t('dashboard.my')} sx={{ '.MuiListItemText-primary': {fontWeight: 'bold'} }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={onClose}
            sx={{
              minHeight: 56,
              justifyContent: 'initial',
              px: 2,
              borderRadius: '100px'
            }}
            href={`#${user?.url}repos`}
            className='no-anchor-styles'
            selected={location.pathname === (user?.url + 'repos')}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 1.75,
                justifyContent: 'center',
              }}
            >
              <FolderOpenIcon color={location.pathname === (user?.url + 'repos') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary={t('user.my_repositories')} sx={{ '.MuiListItemText-primary': {fontWeight: 'bold'} }} />
            <span><b>{((user?.collections || 0) + (user?.sources + 0)).toLocaleString()}</b></span>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider style={{width: '100%', marginTop: '16px'}} />
      <List sx={{maxHeight: '300px', overflow: 'auto', p: 0}}>
        <ListItem
          disablePadding
          sx={{ display: 'block', padding: 2, borderRadius: '100px' }}
          secondaryAction={
            <Button edge="end" aria-label="delete" variant='text' color='primary' sx={{textTransform: 'none'}}>
              <b>{t('common.create')}</b>
            </Button>
          }
        >
          <ListItemText
            primary={
              <Typography
                component="div"
                sx={{color: 'secondary.main', fontWeight: 'bold'}}>
                {t('org.my')}
              </Typography>
            }
          />
        </ListItem>
        {
          orgs.map(org => (
            <ListItem disablePadding sx={{ display: 'block', maxWidth: '336px' }} key={org.url}>
              <ListItemButton
                onClick={onClose}
                sx={{
                  minHeight: 56,
                  justifyContent: 'initial',
                  px: 2,
                  borderRadius: '100px'
                }}
                href={`#${org?.url}`}
                className='no-anchor-styles'
                selected={location.pathname.includes(org?.url)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 45,
                    mr: 1.75,
                    justifyContent: 'center',
                  }}
                >
                  <OrgIcon org={org} iconColor={location.pathname.includes(org?.url) ? 'primary' : undefined} noLink strict />
                </ListItemIcon>
                <ListItemText primary={org.name} sx={{ '.MuiListItemText-primary': {fontWeight: 'bold'} }} />
              </ListItemButton>
            </ListItem>
          ))
        }
      </List>
      <Divider style={{width: '100%', marginTop: '16px'}} />
      <List sx={{maxHeight: '300px', overflow: 'auto', p: 0}}>
        <ListItem
          disablePadding
          sx={{ display: 'block', padding: 2, borderRadius: '100px' }}
          secondaryAction={
            <span><b>{bookmarks?.length}</b></span>
          }>
          <ListItemText
            primary={
              <Typography
                component="div"
                sx={{color: 'secondary.main', fontWeight: 'bold'}}>
                {t('bookmarks.name')}
              </Typography>
            }
          />
        </ListItem>
        {
          bookmarks.map(bookmark => (
            <ListItem disablePadding sx={{ display: 'block', maxWidth: '336px' }} key={bookmark.id}>
              <ListItemButton
                onClick={onClose}
                sx={{
                  minHeight: 56,
                  justifyContent: 'initial',
                  px: 2,
                  borderRadius: '100px'
                }}
                href={`#${bookmark?.resource_uri}`}
                className='no-anchor-styles'
              >
                <ListItemIcon
                  sx={{
                    minWidth: 45,
                    mr: 1.75,
                    justifyContent: 'center',
                  }}
                >
                  {
                    getIcon(bookmark, {color: 'secondary.main'})
                  }
                </ListItemIcon>
                <ListItemText primary={bookmark.resource.name || bookmark.resource.id} sx={{ '.MuiListItemText-primary': {fontWeight: 'bold'} }} />
              </ListItemButton>
            </ListItem>
          ))
        }
      </List>
    </Drawer>
  )
}

export default LeftMenu;
