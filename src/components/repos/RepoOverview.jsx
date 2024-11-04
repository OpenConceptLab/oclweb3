import React from 'react'
import { useTranslation } from 'react-i18next'
import RepoEmptyOverview from './RepoEmptyOverview'

const RepoOverview = ({ repo, height }) => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12 padding-0'>
      {
        repo?.id &&
          <div className='col-xs-12' style={{height: height || '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <RepoEmptyOverview label={t('repo.no_overview')} />
          </div>
      }
    </div>
  )
}

export default RepoOverview;
