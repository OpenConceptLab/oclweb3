import React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import { map } from 'lodash'
import UserIcon from '../users/UserIcon';
import Link from '../common/Link'

const MemberList = ({ members, open, onClose }) => {
  const { t } = useTranslation()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll='paper'
      maxWidth="xs"
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'surface.n92',
          borderRadius: '28px',
          minWidth: '312px',
          minHeight: '262px',
          padding: 0
        }
      }}
    >
      <DialogTitle sx={{p: 3, color: 'surface.dark', fontSize: '22px', textAlign: 'left'}}>
        {t('org.browse_members')}
      </DialogTitle>
      <DialogContent style={{padding: 0}}>
        <List sx={{ width: '100%', bgcolor: 'surface.n92', p: 0, maxHeight: 700 }}>
          {
            map(members, (member, i) => (
              <React.Fragment>
                <ListItem alignItems="flex-start" key={member.url} sx={{padding: '8px 24px 8px 16px'}}>
                  <ListItemAvatar sx={{marginTop: '4px', minWidth: 'auto', mr: 2}}>
                    <UserIcon user={member} sx={{width: '40px', height: '40px'}} />
                  </ListItemAvatar>
                  <ListItemText
                    sx={{
                      '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '14px'},
                      '.MuiListItemText-secondary': {color: 'default.light', fontSize: '12px'}
                    }}
                    primary={member.name}
                    secondary={member.company}
                  />
                </ListItem>
                {
                  i !== members.length - 1 &&
                    <Divider component="li" />
                }
              </React.Fragment>
            ))
          }
        </List>
      </DialogContent>
      <DialogActions sx={{p: 3}}>
        <Link sx={{fontSize: '14px'}} label={t('common.close')} onClick={onClose} />
      </DialogActions>
    </Dialog>
  )
}

export default MemberList;
