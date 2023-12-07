import React from 'react';
import ConceptFilledIcon from '@mui/icons-material/Circle';
import ConceptOutlinedIcon from '@mui/icons-material/CircleOutlined';


const ConceptIcon = ({selected, ...rest}) => {
  return selected ? <ConceptFilledIcon {...rest} /> : <ConceptOutlinedIcon {...rest} />
}

export default ConceptIcon;
