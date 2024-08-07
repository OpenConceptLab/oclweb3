import React from 'react';
import { useTranslation } from 'react-i18next';
import Bookmarks from '../common/Bookmarks';
import About from '../common/About';
import OrgMembers from './OrgMembers';
import OrgStatistics from './OrgStatistics';
import Paper from '@mui/material/Paper'
import EmptyOverview from '../common/EmptyOverview'
import CanonicalURLIcon from '../common/CanonicalURLIcon';
import Link from '../common/Link'


const OrgOverview = ({ org, bookmarks, members, height }) => {
  const { t } = useTranslation()
  const repos = (org?.public_sources || 0) + (org?.public_collections || 0)

  return (
    <div className='col-xs-12 padding-0' style={{height: height || '100%' }}>
      <div className='col-xs-9' style={{padding: '0 16px', height: '100%', overflow: 'auto', width: '80%'}}>
        <Bookmarks bookmarks={bookmarks} />
        <About text={org?.text} title={t('org.about_the_org')} />
        {
          Boolean(org?.id && repos == 0) &&
            <div className='col-xs-12' style={{marginTop: '15%', marginBottom: '16px'}}>
              <EmptyOverview label={`${org.name} ${t('org.org_have_not_created_public_repos_suffix')}`} />
            </div>
        }
      </div>
      <Paper className='col-xs-3' sx={{width: '20% !important', borderLeft: '0.5px solid', borderColor: 'surface.n90', borderRadius: 0, boxShadow: 'none', padding: '16px', height: '100%', overflow: 'auto', backgroundColor: 'default.main'}}>
        <div className='col-xs-12 padding-0'>
          <OrgStatistics org={org} members={members} />
        </div>
        <div className='col-xs-12 padding-0'>
          <OrgMembers members={members} />
        </div>
        <div className='col-xs-12 padding-0'>
          <Link label={t('url_registry.view_canonical_url_registry')} href={`#/orgs/${org.id}/url-registry`} sx={{fontSize: '12px'}} startIcon={<CanonicalURLIcon fontSize='inherit' />} />
        </div>
      </Paper>
    </div>
  )
}

export default OrgOverview
