import React from 'react';
import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip'
import OrganizationIcon from '@mui/icons-material/AccountBalance';

const Icon = ({ org, logoClassName, strict, iconColor }) => {
  return org?.logo_url ?
    <img src={org.logo_url} className={logoClassName || 'user-img-small'} /> :
  (
    strict ?
      <OrganizationIcon color={iconColor} /> :
    <Chip variant='outlined' icon={<OrganizationIcon fontSize='inherit' />} label={org.id} />
  )
}

const OrgIcon = ({ org, logoClassName, strict, iconColor, noLink }) => {
  return noLink ?
    <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} /> :
  <Link to={org?.url}>
    <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} />
  </Link>
}

export default OrgIcon;
