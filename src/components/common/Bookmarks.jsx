import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import map from 'lodash/map'
import PinIcon from './PinIcon';
import Bookmark from './Bookmark';

const Bookmarks = ({ bookmarks, canPin, onDelete, style }) => {
  const { t } = useTranslation()

  return bookmarks && bookmarks?.length ? (
    <div className='col-xs-12 padding-0' style={style}>
      <Typography component='h3' sx={{margin: 0, fontWeight: 'bold', display: 'flex'}}>
        <PinIcon sx={{mr: 1, color: 'surface.contrastText'}} />
        {t('bookmarks.pinned_repos')}
      </Typography>
      <div className='col-xs-12 padding-0' style={{width: '100%'}}>
        {
          map(bookmarks, bookmark => (
            <Bookmark key={bookmark.id} bookmark={bookmark} onDelete={canPin ? onDelete : undefined} />
          ))
        }
      </div>
    </div>
  ) : null
}

export default Bookmarks
