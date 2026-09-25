import React from 'react'
import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip'
import AccessIcon from './AccessIcon'


const AccessChip = ({public_access, ...rest}) => {
  const { t } = useTranslation()
  const isPublic = public_access?.toLowerCase() === 'view'
  return (
    <Chip
      size='small'
      variant='outlined'
      icon={<AccessIcon isPublic={isPublic} fontSize='inherit' />}
      label={isPublic ? t('common.public') : t('common.private')}
      {...rest}
    />
  )
}

export default AccessChip;
