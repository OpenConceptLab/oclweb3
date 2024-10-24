import React from 'react'
import { useTranslation } from 'react-i18next'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import ArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import RepoChip from '../repos/RepoChip'
import ConceptChip from '../concepts/ConceptChip';

const borderColor = 'rgba(0, 0, 0, 0.12)'

const FromConceptCard = ({ mapping }) => {
  const { t } = useTranslation()
  const getRepoURL = () => {
    let url = mapping.from_source_url
    if(mapping.from_source_version && !url?.includes(`/${mapping.from_source_version}/`))
      url += mapping.from_source_version + '/'
    return url
  }
  const repoURL = getRepoURL()
  return (
    <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px'}}>
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
        {t('common.from')}
      </Typography>
      <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center'}}>
        <RepoChip
          noTooltip={!mapping?.from_source_name}
          hideType
          filled={mapping?.from_source_name}
          repo={{url: repoURL, id: repoURL}}
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
              color: mapping?.from_source_name ? 'primary.main' : 'secondary.light',
              fontSize: '18px',
            },
          }}
        />
        <ArrowRightIcon sx={{color: 'secondary.light', margin: '0 6px'}}/>
        <ConceptChip
          hideType
          noTooltip
          filled={Boolean(mapping?.from_concept_name_resolved)}
          concept={{url: mapping.from_concept_url, id: mapping.from_concept_code, name: mapping.from_concept_name_resolved || mapping.from_concept_name, type: 'Concept'}}
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
              color: mapping?.from_concept_name_resolved ? 'primary.main' : 'secondary.light',
              fontSize: '9px',
            },
          }}
        />
      </div>

    </Paper>
  )
}

export default FromConceptCard;

