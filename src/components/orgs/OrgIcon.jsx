import React from 'react';
import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip'
import OrganizationIcon from '@mui/icons-material/AccountBalance';

const OrgIcon = ({ org, logoClassName }) => {
  return (
    <Link to={org?.url}>
      {
        org?.logo_url ?
          <img src={org.logo_url} className={logoClassName || 'user-img-small'} /> :
        <Chip variant='outlined' icon={<OrganizationIcon fontSize='inherit' />} label={org.id} />
      }
    </Link>
  )
}

export default OrgIcon;
