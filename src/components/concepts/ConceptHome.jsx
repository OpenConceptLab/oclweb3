import React from 'react';
import APIService from '../../services/APIService';

const ConceptHome = props => {
  const [concept, setConcept] = React.useState(props.concept || {})

  React.useEffect(() => {
    APIService.new().overrideURL(props.url).get().then(response => {
      setConcept(response.data)
    })
  }, [props.url])
  return (
    <div className='col-xs-12' style={{padding: '16px'}}>
      {`Concept: ${concept?.display_name}`}
    </div>
  )
}

export default ConceptHome;
