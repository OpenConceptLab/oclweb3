import React from 'react'
import Breadcrumbs from '../common/Breadcrumbs'

const ToConcept = ({ mapping }) => {
  return (
    <div className='col-xs-12 padding-0'>
      <Breadcrumbs
        owner={mapping.to_source_owner}
        ownerType={mapping.to_source_owner_type}
        repo={mapping.to_source_name}
        id={mapping.to_concept_code}
        color='secondary.main'
        fontSize='12px'
        concept
        noIcons
      />
      <div className='col-xs-12 padding-0' style={{marginTop: '4px'}}>
           {mapping.to_concept_name || mapping.to_concept_name_resolved}
      </div>
    </div>
  )
}

export default ToConcept
