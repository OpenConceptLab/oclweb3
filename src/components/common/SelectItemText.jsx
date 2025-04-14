import React from 'react';
import ListItemText from '@mui/material/ListItemText'

const SelectItemText = ({icon, primaryText, secondaryText}) => {
  return (
    <ListItemText
      primary={
        <span className='flex-vertical-center'>
          {
            icon &&
              <span className='flex-vertical-center' style={{marginRight: '5px', marginLeft: '-5px'}}>
                {icon}
              </span>
          }
          <span className='flex-vertical-center'>
            {primaryText}
          </span>
        </span>
      }
      secondary={
        <span style={{whiteSpace: 'pre-wrap', fontSize: '12px'}}>
          {secondaryText}
        </span>
      }
    />
  )
}

export default SelectItemText;
