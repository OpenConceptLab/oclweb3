import React from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
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
  return (
    <React.Fragment>
      <Paper className='col-xs-12' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, padding: '16px', borderRadius: '10px'}}>
        <FromConceptCard mapping={mapping} />
        <div className='col-xs-12' style={{padding: '16px', color: SECONDARY_COLORS.light, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <MappingIcon sx={{marginRight: '8px'}}/> {mapping?.map_type}
        </div>
        <ToConceptCard mapping={mapping} />
      </Paper>
      <Paper className='col-xs-12 padding-0' sx={{marginTop: '16px', boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
        <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
          {t('common.properties')}
        </Typography>
        <MappingProperties mapping={mapping} />
      </Paper>
      <Typography component='span' sx={{display: 'inline-block', margin: '32px 0 16px 0', padding: 0, fontSize: '12px', color: 'surface.contrastText'}}>
        {t('common.last_updated')} {formatDateTime(mapping.versioned_updated_on || mapping.updated_on)} {t('common.by')} <Link sx={{fontSize: '12px', justifyContent: 'flex-start'}} href={`#/users/${updatedBy}`} label={updatedBy} />
      </Typography>
    </React.Fragment>
  )
}

export default MappingDetails
