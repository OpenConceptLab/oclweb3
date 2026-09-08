import React from 'react'

import Typography from '@mui/material/Typography'

import get from 'lodash/get'

import ConceptIcon from '../concepts/ConceptIcon'

const ConceptCell = ({mapping, concept, direction, noId, multiLine}) => {
  const conceptName = concept?.display_name || get(mapping, `${direction}_concept_name`) || get(mapping, `${direction}_concept_name_resolved`)
  const conceptId = concept?.id || get(mapping, `${direction}_concept_code`)
  const isPresent = Boolean(concept?.url || get(mapping, `${direction}_concept_url`))
  return (
    <span style={{maxWidth: multiLine ? '100%' : '172px', textAlign: 'left'}}>
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'left'}}>
        <ConceptIcon selected={isPresent} sx={{fontSize: '0.875rem', marginTop: '3px', flexShrink: 0}} />
        <div style={{marginLeft: '8px', minWidth: 0, maxWidth: multiLine ? '100%' : '152px'}}>
          <Typography
            className={multiLine ? 'ellipsis-text-2' : 'overflow-ellipsis'}
            component='div'
            sx={{
              fontSize: '14px',
              color: 'rgba(0, 0, 0, 0.87)',
              ...(multiLine ? {whiteSpace: 'normal', overflowWrap: 'anywhere'} : {})
            }}
          >
            {conceptName}
          </Typography>
          {
            !noId &&
              <Typography component='div' sx={{fontSize: '12px', color: 'secondary.main'}}>
                {conceptId}
              </Typography>
          }
        </div>
      </div>
    </span>
  )
}

export default ConceptCell
