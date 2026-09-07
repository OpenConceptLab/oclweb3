import React from 'react';
import { Popover } from '@mui/material';

import ProcessingStagesList from './ProcessingStagesList';

const ProcessingStagesPopover = ({ version, anchorEl, open, onClose }) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    slotProps={{
      paper: {
        sx: {
          p: 1.5,
          minWidth: 320,
          maxWidth: 400,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'surface.nv80',
          boxShadow: 'none'
        }
      }
    }}
  >
    <ProcessingStagesList version={version} />
  </Popover>
);

export default ProcessingStagesPopover;
