import React from 'react'
import Property from './Property'

import startCase from 'lodash/startCase'
import keys from 'lodash/keys'
import get from 'lodash/get'
import map from 'lodash/map'
import without from 'lodash/without'


const ConceptSummaryProperties = ({concept}) => {
  const getProperties = () => {
    if(concept.property?.length > 0) {
      let values = []
      concept.property.forEach(prop => {
        if(prop?.code){
        let label = prop?.code
        let value;
        if(['concept_class', 'datatype'].includes(label))
          label = startCase(label)
          value = get(prop, get(without(keys(prop), 'code'), '0'))
          values.push(<Property key={label} code={label} value={value} />)
        }
      })
      return values
    }
    return [
      <Property key={1} code='Concept Class' value={concept.concept_class} />,
      <Property key={2} code='Datatype' value={concept.datatype} />,
    ]
  }

  return (
    <>
      {map(getProperties(), prop => prop)}
    </>
  )
}

export default ConceptSummaryProperties
