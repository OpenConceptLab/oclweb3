import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import Bookmarks from '../common/Bookmarks';
import About from '../common/About';
import EmptyOverview from '../common/EmptyOverview'


const OrgOverview = ({ org, bookmarks, height, canPin, onBookmarkDelete }) => {
  const { t } = useTranslation()
  const repos = (org?.public_sources || 0) + (org?.public_collections || 0)
  const overviewBackgroundImage = org?.overview?.background?.image

  const emptyOverview = Boolean(org?.id && repos === 0) && (
    <div className='col-xs-12 padding-0' style={{height: height || '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <EmptyOverview label={`${org.name} ${t('org.org_have_not_created_public_repos_suffix')}`} />
    </div>
  )

  if(overviewBackgroundImage) {
    return (
      <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
        <div
          className='col-xs-12'
          style={{
            padding: '16px',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Bookmarks bookmarks={bookmarks} canPin={canPin} onDelete={onBookmarkDelete} style={{marginBottom: '8px'}} />
          <Paper
            component='section'
            className='col-xs-12 padding-0'
            sx={{
              border: '1px solid',
              borderColor: 'surface.nv80',
              borderRadius: '6px',
              boxShadow: 'none',
              overflow: 'hidden',
              backgroundColor: 'info.contrastText',
            }}
          >
            <div className='col-xs-12' style={{padding: '16px'}}>
              <Typography component='h2' sx={{color: '#000', fontWeight: 'bold'}}>
                {t('org.about_the_org')}
              </Typography>
              <header className='col-xs-12 padding-0' style={{backgroundImage: `url(${overviewBackgroundImage})`, width: '100%', height: '200px', backgroundSize: 'cover'}} />
              <About text={org?.text} expanded style={{marginTop: 0}} />
            </div>
          </Paper>
          {emptyOverview}
        </div>
      </div>
    )
  }

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-12' style={{padding: '0 16px', height: '100%', overflow: 'auto'}}>
        <Bookmarks bookmarks={bookmarks} canPin={canPin} onDelete={onBookmarkDelete} />
        <About text={org?.text} title={t('org.about_the_org')} expanded />
        {emptyOverview}
      </div>
    </div>
  )
}

export default OrgOverview
