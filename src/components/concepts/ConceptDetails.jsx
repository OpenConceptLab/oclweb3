import React from 'react'
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '../../common/utils'
import Locales from './Locales'
import Associations from './Associations'
import ConceptProperties from './ConceptProperties'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const ConceptDetails = ({ concept, repo, mappings, reverseMappings }) => {
  const { t } = useTranslation()
  return (
    <div className='col-xs-12' style={{padding: '16px 0', height: 'calc(100vh - 330px)', overflow: 'auto'}}>
      <Paper className='col-xs-12 padding-0' sx={{marginTop: '16px', boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
        <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
          {t('common.properties')}
        </Typography>
        <ConceptProperties concept={concept} />
      </Paper>
      {
        Boolean(concept.names?.length) &&
          <div className='col-xs-12 padding-0'>
            <Locales concept={concept} locales={concept.names} title={t('concept.name_and_synonyms')} repo={repo} />
          </div>
      }
      {
        Boolean(concept.descriptions?.length) &&
          <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
            <Locales concept={concept} locales={concept.descriptions} title={t('concept.descriptions')} repo={repo} />
          </div>
      }
      <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
        <Associations concept={concept} mappings={mappings} reverseMappings={reverseMappings} />
      </div>
      <Typography component='span' sx={{display: 'inline-block', margin: '32px 0 16px 0', padding: 0, fontSize: '12px', color: 'surface.contrastText'}}>
        {t('common.last_updated')} {formatDateTime(concept.updated_on)}
      </Typography>
    </div>
  )
}

export default ConceptDetails;
