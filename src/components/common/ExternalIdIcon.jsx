import React from 'react'
import SvgIcon from '@mui/material/SvgIcon';

const ExternalIdIcon = ({fill, ...rest}) => {
  return (
    <SvgIcon {...rest}>
      <path d="m16.5 9-3-3v2.25h-6v1.5h6V12m1.5 1.5a7.5 7.5 0 1 1 0-9h-2.047a6 6 0 1 0 0 9H15z" fill={fill}/>
    </SvgIcon>
  )
}

export default ExternalIdIcon;
