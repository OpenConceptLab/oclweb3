import React from 'react'
import Chip from '@mui/material/Chip'
import { Avatar as MuiAvatar } from '@mui/material'
import { PRIMARY_COLORS } from '../../common/colors'

const PRIMARY_STYLE = {
  backgroundColor: `${PRIMARY_COLORS['95']} !important`,
  '&:hover': {
    backgroundColor: `${PRIMARY_COLORS['95']} !important`,
  }
}

const SECONDARY_STYLE = {
  backgroundColor: "#FFF",
  '&:hover': {
    backgroundColor: `${PRIMARY_COLORS['95']} !important`,
  }
}


const ENTITY_CHIP_SIZE_MAP = {
  'medium': {
    height: '36px',
    fontSize: '14px',
    padding: '8px 12px',
    '.MuiChip-label': {
      paddingLeft: 0,
    },
    '.MuiAvatar-root': {
      width: '18px',
      height: '18px',
      margin: '1px 4px 1px 0',
      backgroundColor: 'transparent'
    },
    '.MuiSvgIcon-root': {
      color: '#000',
      fontSize: '18px'
    },
    '.divider-span': {
      width: '3px',
      height: '3px',
      backgroundColor: 'secondary.main',
      margin: '0 8px',
      borderRadius: '100px',
      opacity: 0.8,
    },
    '.entity-type': {
      color: 'secondary.main',
    },
    '.entity-id': {
      color: '#000',
    }
  },
  'small': {
    height: '28px',
    fontSize: '12px',
    padding: '4px 12px',
    '.MuiChip-label': {
      paddingLeft: 0,
      paddingTop: '3px',
    },
    '.MuiAvatar-root': {
      width: '16px',
      height: '16px',
      margin: '0 4px 0 0',
      backgroundColor: 'transparent',
    },
    '.MuiSvgIcon-root': {
        color: '#000',
        fontSize: '16px'
      },
    '.divider-span': {
      width: '3px',
      height: '3px',
      backgroundColor: 'secondary.main',
      margin: '0 8px',
      borderRadius: '100px',
      opacity: 0.8,
    },
    '.entity-type': {
      color: 'secondary.main',
    },
    '.entity-id': {
      color: '#000',
    }
  },
}

const Avatar = ({ entity, icon }) => {
  return entity?.logo_url ? (
    <MuiAvatar alt={entity.name || entity.id || entity.username} src={entity.logo_url} />
  ) :
    <MuiAvatar>
      {icon}
    </MuiAvatar>
}

const Label = ({ entity }) => {
  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <span className='entity-id'>
        <b>{entity.short_code || entity.id || entity.username}</b>
      </span>
      <span className='divider-span' />
      <span className='entity-type'>
        {entity.type}
      </span>
    </span>
  )
}


const BaseEntityChip = ({ entity, icon, primary, size, sx, ...rest }) => {
  const sizeStyle = ENTITY_CHIP_SIZE_MAP[size || 'medium'] || ENTITY_CHIP_SIZE_MAP.medium
  const baseStyle = primary ? PRIMARY_STYLE : SECONDARY_STYLE
  return (
    <Chip
      avatar={<Avatar entity={entity} icon={icon} />}
      label={<Label entity={entity} />}
      variant='outlined'
      sx={{
        borderRadius: '4px',
        minWidth: '95px',
        border: '1px solid',
        borderColor: 'surface.nv80',
        ...baseStyle,
        ...sizeStyle,
        ...sx
      }}
      {...rest}
    />
  )
}

export default BaseEntityChip;
