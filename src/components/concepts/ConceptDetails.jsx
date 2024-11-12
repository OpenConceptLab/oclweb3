import React from 'react'
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { formatDateTime } from '../../common/utils'
import Link from '../common/Link'
import Locales from './Locales'
import Associations from './Associations'
import ConceptProperties from './ConceptProperties'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const ConceptDetails = ({ concept, repo, mappings, reverseMappings, loading }) => {
  const { t } = useTranslation()
  const updatedBy = concept?.version_updated_by || concept?.updated_by
  return (
    <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 245px)', overflow: 'auto'}}>
      {
        loading ?
          <Skeleton variant="rounded" width='100%' height={120} sx={{borderRadius: '10px'}} /> :
        <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
          <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
            {t('common.properties')}
          </Typography>
          <ConceptProperties concept={concept} />
        </Paper>

      }
      {
        loading ?
          <Skeleton variant="rounded" width='100%' height={120} sx={{marginTop: '16px', borderRadius: '10px'}} /> :
        (
          Boolean(concept.names?.length) &&
            <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
              <Locales concept={concept} locales={concept.names} title={t('concept.name_and_synonyms')} repo={repo} />
            </div>
        )
      }
      {
        Boolean(concept.descriptions?.length) &&
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <Locales concept={concept} locales={concept.descriptions} title={t('concept.descriptions')} repo={repo} />
          </div>
      }
      <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
        {
          loading ?
          <Skeleton variant="rounded" width='100%' height={120} sx={{borderRadius: '10px'}} /> :
          <Associations concept={concept} mappings={mappings} reverseMappings={reverseMappings} />
        }
      </div>
      <Typography component='span' sx={{display: 'inline-block', marginTop: '32px', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%'}}>
        {t('common.last_updated')} {
          loading ?
            <Skeleton variant='text' width='40%' sx={{marginLeft: '8px', fontSize: '12px', display: 'inline-block'}} />:
          <>{formatDateTime(concept.versioned_updated_on || concept.updated_on)} {t('common.by')} <Link sx={{fontSize: '12px', justifyContent: 'flex-start'}} href={`#/users/${updatedBy}`} label={updatedBy} /></>
        }
      </Typography>
      <Typography component='span' sx={{display: 'inline-block', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%'}}>
        {t('checksums.standard')} {
          loading ?
            <Skeleton variant='text' width='40%' sx={{marginLeft: '8px', fontSize: '12px', display: 'inline-block'}} />:
          concept?.checksums?.standard
        }
      </Typography>
      <Typography component='span' sx={{display: 'inline-block', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%', marginBottom: '12px'}}>
        {t('checksums.smart')} {
          loading ?
            <Skeleton variant='text' width='40%' sx={{marginLeft: '8px', fontSize: '12px', display: 'inline-block'}} />:
          concept?.checksums?.smart
        }
      </Typography>
    </div>
  )
}

export default ConceptDetails;
