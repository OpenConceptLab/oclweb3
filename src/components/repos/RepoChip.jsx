import React from 'react'
import RepoIcon from '@mui/icons-material/FolderOutlined';
import RepoFilledIcon from '@mui/icons-material/Folder';
import BaseEntityChip from '../common/BaseEntityChip'
import RepoTooltip from './RepoTooltip'

const RepoChip = ({ repo, noTooltip, filled, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={repo}
      icon={filled ? <RepoFilledIcon /> : <RepoIcon />}
      {...rest}
    />
  ) : (
    <RepoTooltip repo={repo}>
      <BaseEntityChip
        entity={repo}
        icon={filled ? <RepoFilledIcon /> : <RepoIcon />}
        {...rest}
      />
    </RepoTooltip>
  )
}

export default RepoChip;
