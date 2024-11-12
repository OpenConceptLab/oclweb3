import React from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RepoChip from '../repos/RepoChip'
import ConceptChip from '../concepts/ConceptChip';

const borderColor = 'rgba(0, 0, 0, 0.12)'

const ToConceptCard = ({ mapping }) => {
  const { t } = useTranslation()
  const getRepoURL = () => {
    let url = mapping.to_source_url
    if(mapping.to_source_version && !url?.includes(`/${mapping.to_source_version}/`))
      url += mapping.to_source_version + '/'
    return url
  }
  const repoURL = getRepoURL()
  return (
    <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor}}>
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderRadius: '10px'}}>
        {t('common.target')}
      </Typography>
      <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
        <RepoChip
          hideType
          basicTooltip={mapping?.to_source_name ? false : repoURL}
          filled={mapping?.to_source_name}
          repo={{url: repoURL, id: repoURL}}
          noLink={!mapping?.to_source_name}
          sx={{
            '.entity-id': {
              marginTop: '2px',
              fontSize: '12px',
              color: '#000',
              maxWidth: '223px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            '.MuiSvgIcon-root': {
              color: mapping?.to_source_name ? 'primary.main' : 'secondary.light',
              fontSize: '18px',
            },
          }}
        />
        <ArrowRightIcon sx={{color: 'secondary.light', margin: '0 6px'}}/>
        <ConceptChip
          hideType
          noTooltip
          noLink={!mapping?.to_concept_name_resolved}
          filled={Boolean(mapping?.to_concept_name_resolved)}
          concept={{url: mapping.to_concept_url, id: mapping.to_concept_code, name: mapping.to_concept_name_resolved || mapping.to_concept_name, type: 'Concept'}}
          sx={{
            '.entity-label': {
              marginTop: '2px',
              fontSize: '12px',
              color: '#000',
              maxWidth: '223px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            '.MuiSvgIcon-root': {
              color: mapping?.to_concept_name_resolved ? 'primary.main' : 'secondary.light',
              fontSize: '9px',
            },
          }}
        />
      </div>
    </Paper>
  )
}

export default ToConceptCard;
