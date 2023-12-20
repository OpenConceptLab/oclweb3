import React from 'react';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const DisplayMenu = ({anchorEl, labelId, onClose, onSelect, selected}) => {
  const { t } = useTranslation();
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
      <MenuItem selected={selected === 'table'} onClick={() => onChange('table')}>{t('search.table')}</MenuItem>
      <MenuItem selected={selected === 'card'} onClick={() => onChange('card')}>{t('search.card')}</MenuItem>
    </Menu>
  )
}

export default DisplayMenu;
