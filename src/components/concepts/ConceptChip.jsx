import React from 'react'
import BaseEntityChip from '../common/BaseEntityChip'
import ConceptTooltip from './ConceptTooltip'
import ConceptIcon from './ConceptIcon';

const ConceptChip = ({ concept, repo, filled, noTooltip, iconColor, repoVersionPreferred, ...rest }) => {
  let _concept = repoVersionPreferred && repo?.id ? {...concept, version_url: repo?.url + (repo.version || repo.id) + '/concepts/' + concept.id + '/'} : concept
  const icon = <ConceptIcon selected={filled} color={iconColor || 'secondary'} sx={{fill: iconColor || 'secondary'}} />
  return noTooltip ? (
    <BaseEntityChip entity={_concept} icon={icon} {...rest} />
  ) : (
    <ConceptTooltip concept={_concept} repo={repo}>
      <BaseEntityChip entity={_concept} icon={icon} {...rest} />
    </ConceptTooltip>
  )
}

export default ConceptChip;
