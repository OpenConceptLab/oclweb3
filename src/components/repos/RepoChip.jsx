import React from 'react'
import RepoIcon from '@mui/icons-material/FolderOutlined';
import BaseEntityChip from '../common/BaseEntityChip'
import RepoTooltip from './RepoTooltip'

const RepoChip = ({ repo, noTooltip, ...rest }) => {
  return noTooltip ? (
    <BaseEntityChip
      entity={repo}
      icon={<RepoIcon />}
      {...rest}
    />
  ) : (
    <RepoTooltip repo={repo}>
        <BaseEntityChip
          entity={repo}
          icon={<RepoIcon />}
          {...rest}
        />
    </RepoTooltip>
  )
}

export default RepoChip;
