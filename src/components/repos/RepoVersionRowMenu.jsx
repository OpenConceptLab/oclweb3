import React from 'react';
import { Divider, Menu, MenuItem, Tooltip } from '@mui/material';
import { LockMark } from '../common/NoticeLocks';

// Declarative row-action menu shared by SourceVersionsTab/CollectionVersionsTab so the
// anchor/open/close chrome isn't hand-rolled per tab. `items` entries are either
// { divider: true } or { key, label, icon, onClick, disabled, danger, tooltip, lock }. `lock` is the reason a
// repository notice locks the action (NoticeLocks): the item is disabled, shows a lock and says why.
const RepoVersionRowMenu = ({ anchorEl, open, onClose, items = [] }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    {items.map((_item, index) => {
      if (_item.divider) return <Divider key={`divider-${index}`} />;
      const item = _item.lock ? { ..._item, disabled: true, tooltip: _item.lock } : _item;

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
          {item.lock && <LockMark />}
        </MenuItem>
      );

      if (!item.tooltip) return menuItem;

      return (
        <Tooltip key={item.key} title={item.tooltip} placement="left">
          <span style={{ display: 'block' }}>{menuItem}</span>
        </Tooltip>
      );
    })}
  </Menu>
);

export default RepoVersionRowMenu;
