import React from 'react';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';
import Typography from '@mui/material/Typography'
import Bookmark from '../common/Bookmark';
import About from '../common/About';
import OrgMembers from './OrgMembers';
import OrgStatistics from './OrgStatistics';
import Paper from '@mui/material/Paper'
import PinIcon from '@mui/icons-material/PushPinOutlined';
import OrgEmptyOverview from './OrgEmptyOverview'

const OrgBookmarks = ({ bookmarks }) => {
  const { t } = useTranslation()

  return bookmarks && bookmarks?.length ? (
    <div className='col-xs-12 padding-0'>
      <Typography component='h3' sx={{margin: '16px 0', fontWeight: 'bold', display: 'flex'}}>
        <PinIcon sx={{mr: 1, color: 'surface.contrastText', transform: 'rotate(45deg)'}} />
        {t('bookmarks.pinned_repos')}
      </Typography>
      <div style={{display: 'flex', alignItems: 'center'}}>
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

const OrgOverview = ({ org, bookmarks, members, height }) => {
  const { t } = useTranslation()
  const repos = (org?.public_sources || 0) + (org?.public_collections || 0)

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-9' style={{padding: '0 16px', height: '100%', overflow: 'auto', width: '80%'}}>
        <OrgBookmarks bookmarks={bookmarks} />
        <About text={org?.text} title={t('org.about_the_org')} />
        {
          Boolean(org?.id && repos == 0) &&
            <div className='col-xs-12' style={{marginTop: '15%', marginBottom: '16px'}}>
              <OrgEmptyOverview org={org} />
            </div>
        }
      </div>
      <Paper className='col-xs-3' sx={{width: '20% !important', borderLeft: '0.5px solid', borderColor: 'surface.n90', borderRadius: 0, boxShadow: 'none', padding: '16px', height: '100%', overflow: 'auto', backgroundColor: 'default.main'}}>
        <div className='col-xs-12 padding-0'>
          <OrgStatistics org={org}/>
        </div>
        <div className='col-xs-12 padding-0'>
          <OrgMembers members={members} />
        </div>
      </Paper>
    </div>
  )
}

export default OrgOverview
