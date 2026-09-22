import React from 'react';
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import SyncIcon from '@mui/icons-material/Sync';

import ProcessingFlag from './ProcessingFlag';
import { isProcessing } from './processingStages';

const ExpansionDropDown = ({ expansions = [], loading = false, selectedExpansion, onChange, variant = 'contained', disabledUrl, autoOpen = false }) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const buttonRef = React.useRef(null);
  const hasAutoOpenedRef = React.useRef(false);

  const onClose = () => setAnchorEl(null);

  React.useEffect(() => {
    if(autoOpen && !hasAutoOpenedRef.current && !loading && expansions.length && buttonRef.current) {
      hasAutoOpenedRef.current = true
      setAnchorEl(buttonRef.current)
    }
  }, [autoOpen, loading, expansions.length]);

  const label = selectedExpansion?.mnemonic
    ? t('repo.expansion_dropdown_label', { mnemonic: selectedExpansion.mnemonic })
    : t('repo.expansions');

  return (
    <React.Fragment>
      <Button
        ref={buttonRef}
        variant={variant}
        size='small'
        color='default'
        onClick={event => setAnchorEl(event.currentTarget)}
        startIcon={
          isProcessing(selectedExpansion) ? (
            <Tooltip title={t('common.processing')}>
              <SyncIcon fontSize='small' color='warning' sx={{ animation: 'ocl-spin 1.6s linear infinite' }} />
            </Tooltip>
          ) : undefined
        }
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
          const isDisabled = Boolean(disabledUrl) && expansion.url === disabledUrl;
          const menuItem = (
            <MenuItem
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => {
                onClose();
                onChange && onChange(expansion);
              }}
            >
              <ListItemText
                primary={
                  <>
                    {expansion.mnemonic || expansion.id}
                    <ProcessingFlag entity={expansion} sx={{ ml: 1, pointerEvents: 'none' }} />
                  </>
                }
                secondary={expansion?.created_on ? moment(expansion.created_on).fromNow() : undefined}
              />
            </MenuItem>
          );
          return isDisabled ? (
            <Tooltip key={expansion.url || expansion.id || expansion.mnemonic} title={t('repo.expansion_already_selected_other_side')} placement='right'>
              <span style={{ display: 'block' }}>{menuItem}</span>
            </Tooltip>
          ) : React.cloneElement(menuItem, { key: expansion.url || expansion.id || expansion.mnemonic });
        })}
      </Menu>
    </React.Fragment>
  );
};

export default ExpansionDropDown;
