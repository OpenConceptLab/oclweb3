import React from 'react';
import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip'
import OrganizationIcon from '@mui/icons-material/AccountBalance';

const Icon = ({ org, logoClassName, strict, iconColor, sx }) => {
  return org?.logo_url ?
    <img src={org.logo_url} className={logoClassName || 'user-img-small'} /> :
  (
    strict ?
      <OrganizationIcon color={iconColor} sx={sx} /> :
    <Chip variant='outlined' icon={<OrganizationIcon fontSize='inherit' />} label={org.id} />
  )
}

const OrgIcon = ({ org, logoClassName, strict, iconColor, noLink, sx }) => {
  return noLink ?
    <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} /> :
  <Link to={org?.url}>
    <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} />
  </Link>
}

export default OrgIcon;
