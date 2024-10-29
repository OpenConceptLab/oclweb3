import React from 'react';
import { useTranslation } from 'react-i18next';
import OrgMembers from './OrgMembers';
import OrgStatistics from './OrgStatistics';
import CanonicalURLIcon from '../common/CanonicalURLIcon';
import Link from '../common/Link'

const OrgSummary = ({org, members }) => {
  const { t } = useTranslation()
  return (
    <>
      <div className='col-xs-12 padding-0'>
        <OrgStatistics org={org} members={members} />
      </div>
      <div className='col-xs-12 padding-0'>
        <OrgMembers members={members} />
      </div>
      <div className='col-xs-12 padding-0'>
        <Link label={t('url_registry.view_canonical_url_registry')} href={`#/orgs/${org.id}/url-registry`} sx={{fontSize: '12px'}} startIcon={<CanonicalURLIcon fontSize='inherit' />} />
      </div>
    </>
  )
}

export default OrgSummary
