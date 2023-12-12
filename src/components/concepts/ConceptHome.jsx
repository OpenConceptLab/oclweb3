import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import APIService from '../../services/APIService';

const ConceptHome = props => {
  const [concept, setConcept] = React.useState(props.concept || {})

  React.useEffect(() => {
    APIService.new().overrideURL(props.url).get().then(response => {
      setConcept(response.data)
    })
  }, [props.url])

  return concept?.display_name ? (
    <div className='col-xs-12' style={{padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <span>{`Concept: ${concept?.display_name}`}</span>
      <span>
        <IconButton size='small' color='secondary' onClick={props.onClose}>
          <CloseIcon fontSize='inherit' />
        </IconButton>
      </span>
    </div>
  ) : null
}

export default ConceptHome;
