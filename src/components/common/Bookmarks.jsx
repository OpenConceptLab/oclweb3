import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import PinIcon from '@mui/icons-material/PushPinOutlined';
import map from 'lodash/map'
import Bookmark from './Bookmark';

const Bookmarks = ({ bookmarks }) => {
  const { t } = useTranslation()

  return bookmarks && bookmarks?.length ? (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold', display: 'flex'}}>
        <PinIcon sx={{mr: 1, color: 'surface.contrastText', transform: 'rotate(45deg)'}} />
        {t('bookmarks.pinned_repos')}
      </Typography>
      <div className='col-xs-12 padding-0'>
        {
          map(bookmarks, (bookmark, i) => (
            <Bookmark
              key={bookmark.id} bookmark={bookmark} isLast={i === (bookmarks.length - 1)} />
          ))
        }
      </div>
    </div>
  ) : null
}

export default Bookmarks
