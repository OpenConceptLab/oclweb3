import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import EntityIcon from './EntityIcon'
import PinIcon from './PinIcon'


const Title = ({ bookmark }) => {
  return (
    <div className='padding-0'>
      <div className='padding-0'>
        <Typography className='ellipsis-text-2' sx={{fontSize: '12px', color: 'surface.contrastText'}}>
          {
            bookmark.resource.repo_type || bookmark.resource.collection_type || bookmark.resource.source_type || bookmark.resource.type
          }
        </Typography>
      </div>
      <div className='padding-0'>
        <Typography className='ellipsis-text-2' component='h2' sx={{fontWeight: 'bold', color: 'surface.dark'}}>
          {bookmark.resource.name || bookmark.resource.id}
        </Typography>
      </div>
    </div>
  )
}

export const getIcon = (bookmark, style) => {
  return <EntityIcon noLink strict entity={bookmark.resource} sx={style || {width: '56px', height: '56px', color: 'secondary.main'}}/>
}
const Bookmark = ({ bookmark, onDelete }) => {
  const { t } = useTranslation()
  const history = useHistory()
  const onClick = () => {
    if(bookmark.resource?.url)
      history.push(bookmark.resource.url)
  }
  const onDeleteClick = event => {
    event.preventDefault()
    event.stopPropagation()
    onDelete(bookmark.id)
  }

  return (
    <Card className='col-xs-4 padding-0' sx={{width: 'calc(33.333% - 8px) !important', backgroundColor: 'surface.main', margin: '4px', padding: 0, height: '97px', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'surface.nv80', borderRadius: '10px', display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={onClick}>
      <CardHeader
        sx={{padding: '4px 8px', width: '100%', cursor: 'pointer', '.MuiCardHeader-avatar': {marginRight: '8px'}, '.MuiCardHeader-content': {overflow: 'hidden'}, '.MuiCardHeader-action': {alignSelf: 'center', margin: 0}}}
        avatar={getIcon(bookmark)}
        title={<Title bookmark={bookmark} />}
        subheader={
          <Typography className='ellipsis-text-1' sx={{fontSize: '14px', color: 'surface.contrastText'}}>
            {bookmark.resource.description || bookmark.resource.full_name}
          </Typography>
        }
        action={
          onDelete ?
            <Tooltip arrow title={t('bookmarks.unpin')}>
              <IconButton size='small' onClick={onDeleteClick} className='bookmark-unpin' sx={{color: 'primary.main'}}>
                <PinIcon pinned fontSize='inherit' />
              </IconButton>
            </Tooltip> :
          undefined
        }
      />
    </Card>
  )
}

export default Bookmark;
