import React from 'react';
import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip'
import OrganizationIcon from '@mui/icons-material/AccountBalance';
import OrgTooltip from './OrgTooltip'

const Icon = ({ org, logoClassName, strict, iconColor, sx, fontSize }) => {
  return org?.logo_url ?
    <img src={org.logo_url} className={logoClassName || 'user-img-small'} /> :
  (
    strict ?
      <OrganizationIcon fontSize={fontSize} color={iconColor} sx={sx} /> :
    <Chip variant='outlined' icon={<OrganizationIcon fontSize='inherit' />} label={org.id} />
  )
}

const OrgIcon = ({ org, noTooltip, logoClassName, strict, iconColor, noLink, sx, fontSize }) => {
  return noTooltip ?
    (
      noLink ?
        <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} fontSize={fontSize} /> :
      <Link to={org?.url}>
        <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} fontSize={fontSize} />
      </Link>
  ) : (
    <OrgTooltip org={org}>
      {
        noLink ?
          <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} fontSize={fontSize} /> :
        <Link to={org?.url}>
          <Icon org={org} logoClassName={logoClassName} strict={strict} iconColor={iconColor} sx={sx} fontSize={fontSize} />
        </Link>
      }
    </OrgTooltip>
  )
}

export default OrgIcon;
