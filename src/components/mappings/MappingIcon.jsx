import React from 'react'
import SvgIcon from '@mui/material/SvgIcon'

const MappingIcon = ({fill, width, height, ...rest}) => {
  return (
    <SvgIcon width={width || "18px"} height={height || "18px"} viewBox="0 0 18 18" fill="none" {...rest}>
      <path d="M11.25 14.25c-.78 0-1.545-.18-2.25-.51-.705.33-1.47.51-2.25.51a5.25 5.25 0 1 1 0-10.5c.78 0 1.545.18 2.25.51.705-.33 1.47-.51 2.25-.51a5.25 5.25 0 0 1 0 10.5zm-4.5-1.5.75-.082A5.232 5.232 0 0 1 6 9c0-1.372.54-2.692 1.5-3.675l-.75-.075a3.75 3.75 0 0 0 0 7.5zM11.625 9c0-1.402-.592-2.67-1.545-3.563l-.75.345A4.115 4.115 0 0 1 10.875 9a4.115 4.115 0 0 1-1.545 3.217l.75.345A4.868 4.868 0 0 0 11.625 9z" fill={fill}/>
    </SvgIcon>
  )
}

export default MappingIcon
