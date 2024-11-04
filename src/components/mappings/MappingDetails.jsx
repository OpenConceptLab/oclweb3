import React from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import find from 'lodash/find'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { SECONDARY_COLORS } from '../../common/colors'
import { formatDateTime } from '../../common/utils'
import Link from '../common/Link'
import FromConceptCard from './FromConceptCard'
import ToConceptCard from './ToConceptCard'
import MappingIcon from './MappingIcon'
import MappingProperties from './MappingProperties'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const MappingDetails = ({ mapping }) => {
  const { t } = useTranslation()
  const updatedBy = mapping?.versioned_updated_by || mapping?.updated_by
  const hasProperties = Boolean(find(['external_id', 'retired', 'sort_weight'], property => Boolean(get(mapping, property, ''))) || !isEmpty(mapping?.extras))
  return (
    <React.Fragment>
      <Paper className='col-xs-12' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, padding: '16px', borderRadius: '10px'}}>
        <FromConceptCard mapping={mapping} />
        <div className='col-xs-12' style={{padding: '16px', color: SECONDARY_COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <MappingIcon sx={{marginRight: '8px'}}/> {mapping?.map_type}
        </div>
        <ToConceptCard mapping={mapping} />
      </Paper>
      {
        hasProperties &&
          <Paper className='col-xs-12 padding-0' sx={{marginTop: '16px', boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
            <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
              {t('common.properties')}
            </Typography>
            <MappingProperties mapping={mapping} />
          </Paper>
      }
      <Typography component='span' sx={{display: 'inline-block', marginTop: '24px', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%'}}>
        {t('common.last_updated')} {formatDateTime(mapping.versioned_updated_on || mapping.updated_on)} {t('common.by')} <Link sx={{fontSize: '12px', justifyContent: 'flex-start'}} href={`#/users/${updatedBy}`} label={updatedBy} />
      </Typography>
      <Typography component='span' sx={{display: 'inline-block', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%'}}>
        {t('checksums.standard')} {mapping?.checksums?.standard}
      </Typography>
      <Typography component='span' sx={{display: 'inline-block', padding: 0, fontSize: '12px', color: 'surface.contrastText', width: '100%'}}>
        {t('checksums.smart')} {mapping?.checksums?.smart}
      </Typography>
    </React.Fragment>
  )
}

export default MappingDetails
