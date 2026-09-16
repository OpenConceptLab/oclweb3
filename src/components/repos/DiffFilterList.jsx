import React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/InfoOutlined';

const DiffFilterList = ({fieldOrder, filterDefinitions, counts, selected, onChange}) => {
  const toggle = field => () => {
    const isSelected = selected.includes(field)
    onChange(isSelected ? selected.filter(f => f !== field) : [...selected, field])
  }

  return (
    <List dense sx={{width: '100%', padding: '8px 0'}}>
      {
        fieldOrder.map(field => {
          const count = counts?.[field] || 0
          const disabled = count === 0
          const definition = filterDefinitions?.[field] || {}
          const labelId = `diff-filter-checkbox-${field}`
          return (
            <ListItemButton key={field} onClick={toggle(field)} disabled={disabled} sx={{p: '4px 12px'}}>
              <ListItemIcon sx={{minWidth: '25px'}}>
                <Checkbox
                  size='small'
                  edge='start'
                  checked={selected.includes(field)}
                  tabIndex={-1}
                  disableRipple
                  disabled={disabled}
                  slotProps={{input: {'aria-labelledby': labelId}}}
                  sx={{padding: '0px 8px', '.MuiSvgIcon-root': {fontSize: '1.1rem'}}}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    {definition.label || field}
                    {
                      definition.tooltip &&
                        <Tooltip title={definition.tooltip}>
                          <InfoIcon sx={{marginLeft: '4px', fontSize: '1rem'}} color='primary' />
                        </Tooltip>
                    }
                  </span>
                }
                slotProps={{primary: {style: {fontSize: '0.875rem'}}}}
                style={{margin: 0}}
              />
              <span style={{fontSize: '0.7rem'}}>{count.toLocaleString()}</span>
            </ListItemButton>
          )
        })
      }
    </List>
  )
}

export default DiffFilterList;
