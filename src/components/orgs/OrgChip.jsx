import React from 'react'
import OrganizationIcon from '@mui/icons-material/AccountBalance';
import BaseEntityChip from '../common/BaseEntityChip'
import OrgTooltip from './OrgTooltip'


const OrgChip = ({ org, noTooltip, tooltipProps, ...rest }) => {
  let _tooltipProps = tooltipProps || {}
  return noTooltip ? (
    <BaseEntityChip
      entity={org}
      icon={<OrganizationIcon />}
      {...rest}
    />
  ) : (
    <OrgTooltip org={org} {..._tooltipProps}>
      <BaseEntityChip
        entity={org}
        icon={<OrganizationIcon />}
        {...rest}
      />
    </OrgTooltip>
  )
}

export default OrgChip;
