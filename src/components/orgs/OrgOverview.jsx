import React from 'react';
import { useTranslation } from 'react-i18next';
import Bookmarks from '../common/Bookmarks';
import About from '../common/About';
import EmptyOverview from '../common/EmptyOverview'


const OrgOverview = ({ org, bookmarks, height }) => {
  const { t } = useTranslation()
  const repos = (org?.public_sources || 0) + (org?.public_collections || 0)

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-12' style={{padding: '0 16px', height: '100%', overflow: 'auto'}}>
        <Bookmarks bookmarks={bookmarks} />
        <About text={org?.text} title={t('org.about_the_org')} expanded />
        {
          Boolean(org?.id && repos === 0) &&
            <div className='col-xs-12 padding-0' style={{height: height || '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
              <EmptyOverview label={`${org.name} ${t('org.org_have_not_created_public_repos_suffix')}`} />
            </div>
        }
      </div>
    </div>
  )
}

export default OrgOverview
