import React from 'react';
import { Divider, Menu, MenuItem, Tooltip } from '@mui/material';

// Declarative row-action menu shared by SourceVersionsTab/CollectionVersionsTab so the
// anchor/open/close chrome isn't hand-rolled per tab. `items` entries are either
// { divider: true } or { key, label, icon, onClick, disabled, danger, tooltip }.
const RepoVersionRowMenu = ({ anchorEl, open, onClose, items = [] }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    {items.map((item, index) => {
      if (item.divider) return <Divider key={`divider-${index}`} />;

      const menuItem = (
        <MenuItem
          key={item.tooltip ? undefined : item.key}
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

      if (!item.tooltip) return menuItem;

      return (
        <Tooltip key={item.key} title={item.tooltip} placement="left">
          <span>{menuItem}</span>
        </Tooltip>
      );
    })}
  </Menu>
);

export default RepoVersionRowMenu;
