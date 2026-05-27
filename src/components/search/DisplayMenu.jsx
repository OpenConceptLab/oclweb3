import React from 'react';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const DEFAULT_OPTIONS = [
  {id: 'table', labelKey: 'search.table'},
  {id: 'card', labelKey: 'search.card'},
]

const DisplayMenu = ({anchorEl, labelId, onClose, onSelect, selected, options}) => {
  const { t } = useTranslation();
  const displayOptions = options || DEFAULT_OPTIONS
  const onChange = newDisplay => {
    onSelect(newDisplay)
    onClose()
  }
  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      MenuListProps={{
        'aria-labelledby': labelId,
      }}
    >
      {
        displayOptions.map(option => (
          <MenuItem key={option.id} selected={selected === option.id} onClick={() => onChange(option.id)}>
            {option.label || t(option.labelKey)}
          </MenuItem>
        ))
      }
    </Menu>
  )
}

export default DisplayMenu;
