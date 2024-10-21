import React from 'react'
import ConceptIcon from '@mui/icons-material/FolderOutlined';
import BaseEntityChip from '../common/BaseEntityChip'
import ConceptTooltip from './ConceptTooltip'

const ConceptChip = ({ concept, noTooltip, iconColor, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={concept}
      icon={<ConceptIcon primary color={iconColor || 'secondary'} />}
      {...rest}
    />
  ) : (
    <RepoTooltip repo={repo}>
      <BaseEntityChip
        entity={concept}
        icon={<ConceptIcon primary color={iconColor || 'secondary'} />}
        {...rest}
      />
    </RepoTooltip>
  )
}

export default ConceptChip;
