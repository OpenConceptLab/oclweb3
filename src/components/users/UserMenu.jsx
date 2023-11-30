import React from 'react';
import { useTranslation } from 'react-i18next';
import Divider from '@mui/material/Divider';
import ProfileIcon from '@mui/icons-material/AccountCircle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RepoIcon from '@mui/icons-material/FolderOutlined';
import OrgIcon from '@mui/icons-material/AccountBalance';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';
import LanguageIcon from '@mui/icons-material/Language';
import HelpIcon from '@mui/icons-material/HelpCenterOutlined';
import ChatIcon from '@mui/icons-material/ForumOutlined';
import find from 'lodash/find';
import { getCurrentUser, logoutUser, isLoggedIn, getLoginURL } from '../../common/utils'
import { LANGUAGES } from '../../common/constants';
import Button from '../common/Button';
import Drawer from '../common/Drawer';
import UserProfileButton from './UserProfileButton';
import CloseIconButton from '../common/CloseIconButton';

const UserMenu = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const [languageOpen, setLanguageOpen] = React.useState(false)
  const selectedLanguage = find(LANGUAGES, {locale: i18n.language})
  const authenticated = isLoggedIn()
  const user = getCurrentUser()
  const onLanguageSelect = locale => {
    i18n.changeLanguage(locale)
    setLanguageOpen(false)
  }
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div className='col-xs-12' style={{padding: '15px'}}>
        <div className='col-xs-12 padding-0'>
          {
            authenticated &&
              <div className='col-xs-2 padding-0'>
                <UserProfileButton />
              </div>
          }
          {
            authenticated &&
              <div className='col-xs-9 padding-0'>
                <div className='col-xs-12 padding-0'>
                  <b>{user?.username}</b>
                </div>
                <div className='col-xs-12 padding-0'>
                  {user?.name}
                </div>
              </div>
          }
          <div className='col-xs-1 padding-0' style={{float: 'right'}}>
            <CloseIconButton onClick={onClose} />
          </div>
        </div>
        <div className='col-xs-12 padding-0'>
          {
            authenticated ?
              <List>
                <ListItemButton sx={{p: 1}}>
                  <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                    <ProfileIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('user.my_profile')} />
                </ListItemButton>
              </List> :
            <div className='col-xs-12 padding-0' style={{marginBottom: '24px'}}>
              <Button className='no-anchor-styles' label={t('auth.sign_in')} sx={{ bgcolor: 'primary.light', maxWidth: '100%', minWidth: '92px' }} href={getLoginURL()} component='a' />
            </div>
          }
        </div>
        <Divider style={{width: '100%'}} />
        {
          authenticated &&
            <React.Fragment>
              <div className='col-xs-12 padding-0'>
                <List>
                  <ListItemButton sx={{p: 1}}>
                    <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                      <RepoIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('user.my_repositories')} />
                    <span>0</span>
                  </ListItemButton>
                  <ListItemButton sx={{p: 1}}>
                    <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                      <OrgIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('user.my_organizations')} />
                    <span>0</span>
                  </ListItemButton>
                  <ListItemButton sx={{p: 1}}>
                    <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                      <BookmarkIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('user.my_bookmarks')} />
                    <span>0</span>
                  </ListItemButton>
                </List>
              </div>
              <Divider style={{width: '100%'}} />
            </React.Fragment>
        }
        <div className='col-xs-12 padding-0'>
          <List>
            <ListItemButton sx={{p: 1}} onClick={() => setLanguageOpen(!languageOpen)}>
              <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary={selectedLanguage.name} secondary={t('common.language')} />
              {languageOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={languageOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {
                  LANGUAGES.map(lang => (
                    <ListItemButton  sx={{ pl: 5.75 }} selected={lang.locale === selectedLanguage.locale} key={lang.locale} onClick={() => onLanguageSelect(lang.locale)}>
                      <ListItemText primary={lang.locale.toUpperCase()} secondary={lang.name} />
                    </ListItemButton>
                  ))
                }
              </List>
            </Collapse>
          </List>
        </div>
        <Divider style={{width: '100%'}} />
        <div className='col-xs-12 padding-0'>
          <List>
            <ListItemButton sx={{p: 1}} component='a' className='no-anchor-styles' href='https://docs.openconceptlab.org' target='_blank' rel='noopener noreferrer'>
              <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary={t('common.help_and_documentation')} />
            </ListItemButton>
            <ListItemButton sx={{p: 1}} component='a' className='no-anchor-styles' href='https://chat.openconceptlab.org/' target='_blank' rel='noopener noreferrer'>
              <ListItemIcon sx={{minWidth: 'auto', paddingRight: '14px'}}>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary={t('common.chat')} />
            </ListItemButton>
          </List>
        </div>
        <Divider style={{width: '100%'}} />
        {
          authenticated &&
            <div className='col-xs-12 padding-0' style={{marginTop: '24px'}}>
              <Button label={t('auth.sign_out')} sx={{ bgcolor: 'primary.light', maxWidth: '100%' }} onClick={() => logoutUser()} />
            </div>
        }
      </div>
    </Drawer>
  )
}

export default UserMenu
