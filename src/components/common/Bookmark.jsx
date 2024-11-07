import React from 'react';
import { useHistory } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import EntityIcon from './EntityIcon'


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

const Bookmark = ({ bookmark, isLast }) => {
  const history = useHistory()

  const onClick = () => {
    if(bookmark.resource?.url)
      history.push(bookmark.resource.url)
  }

  return (
    <Card className='col-xs-3 padding-0' sx={{width: isLast ? '25%' : 'calc(25% - 8px) !important', backgroundColor: 'surface.main', mr: isLast ? 0 : 1, padding: 0, height: '97px', boxShadow: 'none', borderBottom: '1px solid', borderColor: 'surface.nv80', borderRadius: 0, display: 'flex', alignItems: 'center', cursor: 'pointer'}} onClick={onClick}>
      <CardHeader
        sx={{padding: '8px 16px', paddingBottom: '8px !important', cursor: 'pointer'}}
        avatar={getIcon(bookmark)}
        title={<Title bookmark={bookmark} />}
        subheader={
          <Typography className='ellipsis-text-1' sx={{fontSize: '14px', color: 'surface.contrastText'}}>
            {bookmark.resource.description || bookmark.resource.full_name}
          </Typography>
        }
      />
    </Card>
  )
}

export default Bookmark;
