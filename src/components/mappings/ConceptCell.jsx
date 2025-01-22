import React from 'react'

import Typography from '@mui/material/Typography'

import get from 'lodash/get'

import ConceptIcon from '../concepts/ConceptIcon'

const ConceptCell = ({mapping, concept, direction, noId}) => {
  const conceptName = concept?.display_name || get(mapping, `${direction}_concept_name`) || get(mapping, `${direction}_concept_name_resolved`)
  const conceptId = concept?.id || get(mapping, `${direction}_concept_code`)
  const isPresent = Boolean(concept?.url || get(mapping, `${direction}_concept_url`))
  return (
    <span style={{maxWidth: '172px', textAlign: 'left'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
        <ConceptIcon selected={isPresent} sx={{fontSize: '0.875rem'}} />
        <Typography className='overflow-ellipsis' component='span' sx={{maxWidth: '152px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.87)', marginLeft: '8px'}}>
          {conceptName}
        </Typography>
        <span/>
      </div>
      {
        !noId &&
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'left'}}>
            <Typography component='span' sx={{fontSize: '12px', color: 'secondary.main'}}>
              {conceptId}
            </Typography>
          </div>
      }
    </span>
  )
}

export default ConceptCell
