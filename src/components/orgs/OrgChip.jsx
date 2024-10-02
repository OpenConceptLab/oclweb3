import React from 'react'
import OrganizationIcon from '@mui/icons-material/AccountBalance';
import BaseEntityChip from '../common/BaseEntityChip'
import OrgTooltip from './OrgTooltip'


const OrgChip = ({ org, noTooltip, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={org}
      icon={<OrganizationIcon />}
      {...rest}
    />
  ) : (
    <OrgTooltip org={org}>
      <BaseEntityChip
        entity={org}
        icon={<OrganizationIcon />}
        {...rest}
      />
    </OrgTooltip>
  )
}

export default OrgChip;
