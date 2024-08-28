import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

const FollowingIcon = ({width, height, fill, ...rest}) => {
  return (
    <SvgIcon width={width || "24px"} height={height || '24px'} fill={fill || 'surface.contrastText'} {...rest}>
      <path d="m23.5 17-5 5-3.5-3.5 1.5-1.5 2 2 3.5-3.5 1.5 1.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 8c.5 0 .97-.07 1.42-.21-.27.71-.42 1.43-.42 2.21v.45l-1 .05c-5 0-9.27-3.11-11-7.5 1.73-4.39 6-7.5 11-7.5s9.27 3.11 11 7.5c-.25.64-.56 1.26-.92 1.85-.9-.54-1.96-.85-3.08-.85-.78 0-1.5.15-2.21.42.14-.45.21-.92.21-1.42a5 5 0 1 0-5 5z" fill={fill || 'surface.contrastText'}/>
    </SvgIcon>
  )
}

export default FollowingIcon;
