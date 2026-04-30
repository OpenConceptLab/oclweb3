import React from 'react';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon,
} from '@mui/icons-material';

const ReferenceChip = (props) => {
  const isResolved = Boolean(props.last_resolved_at)
  const type = props.reference_type;
  let icon = <span />;
  if(type && type.toLowerCase() === 'mappings')
    icon = <LinkIcon fontSize="small" color={isResolved ? 'primary' : 'secondary'} />;
  else if(type && type.toLowerCase() === 'concepts')
    icon = <LocalOfferIcon fontSize='small' color={isResolved ? 'primary' : 'secondary'} />;

  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <span style={{marginRight: '6px'}}>{icon}</span>
      <span>{props.showTranslation ? props.translation : props.expression}</span>
    </span>
  )
}

export default ReferenceChip;
