import React from 'react'
import BaseEntityChip from '../common/BaseEntityChip'
import ConceptTooltip from './ConceptTooltip'
import ConceptIcon from './ConceptIcon';

const ConceptChip = ({ concept, filled, noTooltip, iconColor, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={concept}
      icon={<ConceptIcon selected={filled} color={iconColor || 'secondary'} />}
      {...rest}
    />
  ) : (
    <ConceptTooltip concept={concept}>
      <BaseEntityChip
        entity={concept}
        icon={<ConceptIcon selected={filled} color={iconColor || 'secondary'} />}
        {...rest}
      />
    </ConceptTooltip>
  )
}

export default ConceptChip;
