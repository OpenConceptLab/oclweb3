import React from 'react';
import { useTranslation } from 'react-i18next'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import { map, some, find } from 'lodash';

import { PRIMARY_COLORS, SECONDARY_COLORS } from '../../common/colors';
import { isSameSortField } from './columns';

const CHIP_SX = {
  minWidth: 'auto',
  padding: '0px 8px',
  fontSize: '11px',
  lineHeight: '20px',
  borderRadius: '12px',
  textTransform: 'none',
  whiteSpace: 'nowrap',
}

// applied wins over default: filled primary > outlined primary > outlined neutral
const chipSx = (applied, isDefault) => {
  if(applied)
    return {...CHIP_SX, backgroundColor: PRIMARY_COLORS.main, borderColor: PRIMARY_COLORS.main, color: PRIMARY_COLORS.contrastText, '&:hover': {backgroundColor: PRIMARY_COLORS['30'], borderColor: PRIMARY_COLORS['30']}}
  if(isDefault)
    return {...CHIP_SX, borderColor: PRIMARY_COLORS.main, color: PRIMARY_COLORS.main}
  return {...CHIP_SX, borderColor: SECONDARY_COLORS['80'], color: SECONDARY_COLORS.main}
}

const SortMenu = ({anchorEl, labelId, onClose, order, orderBy, onChange, config}) => {
  const { t } = useTranslation()
  const presets = config?.presets || []
  const fields = config?.fields || []

  const apply = (newOrderBy, newOrder) => {
    onChange(newOrderBy, newOrder)
    onClose()
  }

  // with a query and no explicit sort the API falls back to _score desc, so
  // relevance is what's actually applied even though nothing is in the URL
  const relevance = presets[0]?.orderBy === 'score' ? presets[0] : undefined
  const appliedOrderBy = orderBy || relevance?.orderBy
  const appliedOrder = orderBy ? order : (relevance ? relevance.order : order)
  const isApplied = chip => isSameSortField(appliedOrderBy, chip.orderBy) && appliedOrder === chip.order

  /*
   * Clicking a row that isn't sorted on applies its default (first) chip.
   * Clicking the row that IS sorted on flips within the applied chip's own
   * pair, so ID cycles A-Z <-> Z-A or 0-9 <-> 9-0 depending on which is on -
   * chips that share an orderBy are the two directions of one pair.
   */
  const onRowClick = field => {
    const applied = find(field.chips, isApplied)
    if(!applied)
      return apply(field.chips[0].orderBy, field.chips[0].order)
    const alternate = find(field.chips, chip => chip.orderBy === applied.orderBy && chip.order !== applied.order)
    return apply((alternate || applied).orderBy, (alternate || applied).order)
  }

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        list: {
          'aria-labelledby': labelId,
        },
      }}
      sx={{
        '& .MuiList-root': {minWidth: '260px'}
      }}
    >
      {
        map(presets, preset => (
          <MenuItem
            key={`${preset.orderBy}-${preset.order}`}
            selected={isApplied(preset)}
            onClick={() => apply(preset.orderBy, preset.order)}
          >
            <ListItemText>{t(preset.labelKey)}</ListItemText>
          </MenuItem>
        ))
      }
      {
        presets.length > 0 && fields.length > 0 &&
          <Divider />
      }
      {
        map(fields, field => {
          const label = field.label || t(field.labelKey)
          const defaultChip = field.chips[0]
          return (
            <MenuItem
              key={field.id}
              selected={some(field.chips, isApplied)}
              onClick={() => onRowClick(field)}
            >
              <ListItemText sx={{marginRight: '16px'}}>{label}</ListItemText>
              <span style={{display: 'flex', gap: '4px'}}>
                {
                  map(field.chips, chip => (
                    <Tooltip key={`${chip.orderBy}-${chip.order}`} title={t(chip.tooltipKey, {field: label})}>
                      <Button
                        variant='outlined'
                        size='small'
                        sx={chipSx(isApplied(chip), chip === defaultChip)}
                        onClick={event => {
                          event.stopPropagation()
                          apply(chip.orderBy, chip.order)
                        }}
                      >
                        {t(chip.labelKey)}
                      </Button>
                    </Tooltip>
                  ))
                }
              </span>
            </MenuItem>
          )
        })
      }
      {
        // only an explicit sort can be cleared - without one the API default
        // (relevance with a query) is already what's showing
        Boolean(orderBy) && [
          <Divider key='clear-divider' />,
          <MenuItem key='clear' onClick={() => apply(null, null)}>
            <ListItemText>{t('sort.clear')}</ListItemText>
          </MenuItem>
        ]
      }
    </Menu>
  )
}

export default SortMenu;
