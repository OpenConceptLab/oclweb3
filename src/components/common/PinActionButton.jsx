import React from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PinIcon from './PinIcon';

// Row-level pin toggle for pinnable listings (repos, orgs).
const PinActionButton = ({ item, pin, onToggle, disabled, size, sx }) => {
  const { t } = useTranslation()
  const pinned = Boolean(pin?.id)
  const onClick = event => {
    event.preventDefault()
    event.stopPropagation()
    if(!disabled)
      onToggle(item)
  }

  return (
    <Tooltip arrow title={pinned ? t('bookmarks.unpin') : (disabled ? t('bookmarks.max_pins_reached') : t('bookmarks.pin'))}>
      <span>
        <IconButton
          size={size || 'small'}
          onClick={onClick}
          disabled={disabled}
          sx={{color: pinned ? 'primary.main' : 'surface.contrastText', ...sx}}
        >
          <PinIcon pinned={pinned} fontSize='inherit' />
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default PinActionButton;
