import React from 'react';
import { Divider, Menu, MenuItem } from '@mui/material';

// Declarative row-action menu shared by SourceVersionsTab/CollectionVersionsTab so the
// anchor/open/close chrome isn't hand-rolled per tab. `items` entries are either
// { divider: true } or { key, label, icon, onClick, disabled, danger }.
const RepoVersionRowMenu = ({ anchorEl, open, onClose, items = [] }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    {items.map((item, index) => {
      if (item.divider) return <Divider key={`divider-${index}`} />;

      return (
        <MenuItem
          key={item.key}
          disabled={item.disabled}
          onClick={() => {
            onClose();
            item.onClick();
          }}
          sx={item.danger ? { color: 'error.main', '& .MuiSvgIcon-root': { color: 'error.main' } } : undefined}
        >
          {item.icon && React.cloneElement(item.icon, { fontSize: 'small', sx: { mr: 1 } })}
          {item.label}
        </MenuItem>
      );
    })}
  </Menu>
);

export default RepoVersionRowMenu;
