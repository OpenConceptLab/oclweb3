import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import DownIcon from '@mui/icons-material/ArrowDropDown';

const ExpansionDropDown = ({ expansions = [], loading = false, selectedExpansion, onChange }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const onClose = () => setAnchorEl(null);

  const label = selectedExpansion?.mnemonic
    ? t('repo.expansion_dropdown_label', { mnemonic: selectedExpansion.mnemonic })
    : t('repo.expansions');

  return (
    <React.Fragment>
      <Button
        variant='contained'
        size='small'
        color='default'
        onClick={event => setAnchorEl(event.currentTarget)}
        endIcon={
          loading ? <CircularProgress size={14} color='inherit' /> : <DownIcon fontSize='small' />
        }
        disabled={loading || !expansions.length}
        sx={{
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        slotProps={{ list: { sx: { minWidth: '240px', py: 0.5 } } }}
      >
        {expansions.map(expansion => {
          const isSelected = selectedExpansion?.url === expansion.url;
          return (
            <MenuItem
              key={expansion.url || expansion.id || expansion.mnemonic}
              selected={isSelected}
              onClick={() => {
                onClose();
                onChange && onChange(expansion);
              }}
            >
              {isSelected ? <CheckIcon fontSize='small' sx={{ mr: 1 }} /> : <span style={{ width: 20, display: 'inline-block' }} />}
              {expansion.mnemonic || expansion.id}
            </MenuItem>
          );
        })}
      </Menu>
    </React.Fragment>
  );
};

export default ExpansionDropDown;
