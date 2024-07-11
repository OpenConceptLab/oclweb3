import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import OCLEmptyGraphic from '../common/OCLEmptyGraphic'
import Button from '../common/Button';

const OrgEmptyOverview = ({ org }) => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12 padding-0' style={{textAlign: 'center'}}>
      <OCLEmptyGraphic />
      <Typography sx={{fontSize: '14px', color: 'default.light', marginTop: '16px'}}>
        {org.name} {t('org.org_have_not_created_public_repos_suffix')}
      </Typography>
      <Button label={t('dashboard.create_repository')} color='primary' variant='outlined' sx={{marginTop: '10px'}} />
    </div>
  )
}

export default OrgEmptyOverview
