import React from 'react';
import RepoOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RepoFilledIcon from '@mui/icons-material/Folder';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';


const RepoIcon = ({selected, isVersion, ...rest}) => {
  if(isVersion)
    return <VersionIcon {...rest} />
  return selected ? <RepoFilledIcon color='primary' {...rest} /> : <RepoOutlinedIcon {...rest} />
}

export default RepoIcon;
