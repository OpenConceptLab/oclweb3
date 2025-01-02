import React from 'react';
import { useTranslation } from 'react-i18next'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import startCase from 'lodash/startCase'
import map from 'lodash/map'

import Link from '../common/Link'


const SearchHighlightsDialog = ({onClose, highlight, score, open}) => {
  const { t } = useTranslation()
  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      scroll='paper'
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
        {t('search.search_highlight')}
      </DialogTitle>
      <DialogContent style={{padding: 0}}>
        <List dense sx={{ width: '100%', bgcolor: 'surface.n92', padding: '0 10px', maxHeight: 700 }}>
          {
            map(highlight, (values, key) => (
              <React.Fragment key={key}>
                <ListItem>
                  <ListItemText
                    sx={{
                      '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '12px'},
                      '.MuiListItemText-secondary': {color: 'default.light', fontSize: '14px'}
                    }}
                    primary={startCase(key)}
                    secondary={
                      <React.Fragment>
                        {
                          map(values, value => {
                            value = value.replaceAll('<em>', '<b>').replaceAll('</em>', '</b>').replaceAll(' ', '&nbsp;')
                            return (
                              <Typography
                                key={value}
                                component="span"
                                sx={{ color: 'text.primary', display: 'flex' }}
                                dangerouslySetInnerHTML={{__html: value}}
                              />
                            )})
                        }
                      </React.Fragment>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          }
          <ListItem>
            <ListItemText
              sx={{
                '.MuiListItemText-primary': {color: 'surface.dark', fontSize: '12px'},
                '.MuiListItemText-secondary': {color: 'default.light', fontSize: '14px'}
              }}
              primary='Search Score'
              secondary={
                <Typography
                  component="span"
                  sx={{ color: 'text.primary', display: 'flex', fontWeight: 'bold' }}
                >
                  {score}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{p: 3}}>
        <Link sx={{fontSize: '14px'}} label={t('common.close')} onClick={onClose} />
      </DialogActions>
    </Dialog>
  )
}

export default SearchHighlightsDialog
