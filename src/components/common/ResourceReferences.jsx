import React from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { map } from 'lodash'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const ResourceReferences = ({ references, resourceType }) => {
  const { t } = useTranslation()
  if (!references?.length) return null
  return (
    <Paper className='col-xs-12 padding-0' sx={{marginTop: '16px', boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
        <span>{t('reference.references')} ({references.length})</span>
        <Tooltip arrow title={t('reference.brought_in_by_tooltip', { resource: resourceType || 'resource' })}>
          <InfoOutlinedIcon fontSize='small' sx={{color: 'action.active', cursor: 'help'}} />
        </Tooltip>
      </Typography>
      <List dense disablePadding>
        {map(references, reference => (
          <ListItem key={reference.id} divider sx={{padding: '4px 16px'}}>
            <ListItemText
              primary={reference.expression}
              slotProps={{primary: {sx: {fontSize: '13px', fontFamily: 'monospace', wordBreak: 'break-all'}}}}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default ResourceReferences
