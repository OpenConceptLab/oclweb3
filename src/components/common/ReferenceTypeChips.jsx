import React from 'react';
import Chip from '@mui/material/Chip'
import { useTranslation } from 'react-i18next'


const ReferenceTypeChips = ({ reference }) => {
  const { t } = useTranslation()
  return (
    <span>
    {
      reference.include === false &&
        <Chip color='error' size='small' label={t('reference.exclude')} />
    }
      {
        reference.transform?.toLowerCase() === 'extensional'  &&
          <Chip color='primary' size='small' label={t('reference.extensional')} />
      }
      {
        ['resourceversions', 'intensional'].includes(reference.transform?.toLowerCase())  &&
          <Chip color='primary' size='small' label={t('reference.intensional')} />
      }
      {
        reference.cascade  &&
          <Chip color='success' size='small' label={t('reference.cascade')} />
      }
      {
        reference.version && reference.version !== 'HEAD' &&
          <Chip color='warning' size='small' label={t('reference.versioned_repo')} />
      }
      {
        reference.resource_version &&
          <Chip color='info' size='small' label={t('reference.versioned_resource')} />
      }
      {
        !reference.last_resolved_at && !reference.concepts && !reference.mappings &&
          <Chip color='default' size='small' label={t('reference.unresolved')} />
      }
    </span>
  )
}

export default ReferenceTypeChips
