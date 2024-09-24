import React from 'react'
import SvgIcon from '@mui/material/SvgIcon'

const MappingIcon = ({fill, width, height, ...rest}) => {
  return (
    <SvgIcon width={width || "18px"} height={height || "18px"} fill="none" {...rest}>
      <path d="M9 5c1.04 0 2.06.24 3 .68.94-.44 1.96-.68 3-.68a7 7 0 1 1 0 14c-1.04 0-2.06-.24-3-.68-.94.44-1.96.68-3 .68A7 7 0 1 1 9 5zm6 2-1 .11c1.28 1.3 2 3.06 2 4.89 0 1.83-.72 3.59-2 4.9l1 .1a5 5 0 1 0 0-10zm-6.5 5c0 1.87.79 3.56 2.06 4.75l1-.46c-1.25-1-2.06-2.55-2.06-4.29 0-1.74.81-3.29 2.06-4.29l-1-.46A6.491 6.491 0 0 0 8.5 12z" fill={fill} />
    </SvgIcon>
  )
}

export default MappingIcon