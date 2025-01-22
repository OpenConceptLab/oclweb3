import React from 'react'
import RepoIcon from '@mui/icons-material/FolderOutlined';
import RepoFilledIcon from '@mui/icons-material/Folder';
import BaseEntityChip from '../common/BaseEntityChip'
import RepoTooltip from './RepoTooltip'

const RepoChip = ({ repo, noTooltip, basicTooltip, filled, ...rest }) => {
  const icon = filled ? <RepoFilledIcon /> : <RepoIcon />
  return noTooltip ? (
    <BaseEntityChip entity={repo} icon={icon} {...rest} />
  ) : (
    <RepoTooltip repo={repo} basicTooltip={basicTooltip}>
      <BaseEntityChip entity={repo} icon={icon} {...rest} />
    </RepoTooltip>
  )
}

export default RepoChip;
