import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { WHITE, SECONDARY_COLORS, SURFACE_COLORS } from '../../common/colors'

const HTMLTooltip = styled(({ className, ...props }) => (
  <Tooltip arrow={false} {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: WHITE,
    color: SECONDARY_COLORS.main,
    minWidth: 250,
    width: 'auto',
    maxWidth: 400,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid',
    borderColor: SURFACE_COLORS.nv80,
    borderRadius: '5px',
    padding: '12px',
    boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15);'
  },
}));


export default HTMLTooltip;
