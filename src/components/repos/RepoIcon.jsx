import React from 'react';
import RepoOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RepoFilledIcon from '@mui/icons-material/Folder';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import RepoTooltip from './RepoTooltip'

const Icon = ({isVersion, selected, ...rest}) => {
  if(isVersion)
    return <VersionIcon {...rest}/>
  if(selected)
    return <RepoFilledIcon color='primary' {...rest} />
  return <RepoOutlinedIcon {...rest} />
}


const RepoIcon = ({repo, noTooltip, selected, isVersion, ...rest}) => {
  return noTooltip ? (
    <React.Fragment>
      <Icon isVersion={isVersion} selected={selected} {...rest} />
      </React.Fragment>
  ) : (
    <RepoTooltip repo={repo}>
      <Icon isVersion={isVersion} selected={selected} {...rest} />
    </RepoTooltip>
  )
}

export default RepoIcon;
