import React from 'react';
import PublicIcon from '@mui/icons-material/LanguageOutlined';
import PrivateIcon from '@mui/icons-material/LockOutlined';

const AccessIcon = ({isPublic, public_access, ...rest}) => {
  const _isPublic = isPublic || public_access?.toLowerCase() === 'view'
  return _isPublic ? <PublicIcon {...rest} /> : <PrivateIcon {...rest} />
}

export default AccessIcon
