import React from 'react'
import Breadcrumbs from '../common/Breadcrumbs'

const FromConcept = ({ mapping }) => {
  return (
    <div className='col-xs-12 padding-0'>
      <Breadcrumbs
        owner={mapping.from_source_owner}
        ownerType={mapping.from_source_owner_type}
        repo={mapping.from_source_name}
        id={mapping.from_concept_code}
        color='secondary.main'
        fontSize='12px'
        concept
        noIcons
      />
      <div className='col-xs-12 padding-0' style={{marginTop: '4px'}}>
        {mapping.from_concept_name || mapping.from_concept_name_resolved}
      </div>
    </div>
  )
}

export default FromConcept
