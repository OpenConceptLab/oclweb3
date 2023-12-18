import React from 'react'
import {Dialog, DialogContent} from '@mui/material';
import { BG_GRAY } from '../../common/constants'
import LoadingBall from './LoadingBall';

const LoaderDialog = ({open, message}) => {
  return (
    <Dialog open={open} sx={{'& .MuiDialog-paper': {backgroundColor: BG_GRAY, borderRadius: '12px', width: '360px', minHeight: '262px', textAlign: 'center'}}}>
      <DialogContent>
        <LoadingBall />
        {
          message &&
            <div style={{color: '#5e5c71', fontSize: '22px'}}>{message}</div>
        }
      </DialogContent>
    </Dialog>
  )
}

export default LoaderDialog;
