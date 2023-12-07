import React from 'react';
import RepoOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RepoFilledIcon from '@mui/icons-material/Folder';


const RepoIcon = ({selected, ...rest}) => {
  return selected ? <RepoFilledIcon {...rest} /> : <RepoOutlinedIcon {...rest} />
}

export default RepoIcon;
