import React from 'react'
import {Dialog, DialogContent} from '@mui/material';
import LoadingBall from './LoadingBall';
import { SECONDARY_COLORS } from '../../common/colors'

const LoaderDialog = ({open, message}) => {
  return (
    <Dialog open={open} sx={{'& .MuiDialog-paper': {backgroundColor: 'surface.n96', borderRadius: '12px', width: '360px', minHeight: '262px', textAlign: 'center'}}}>
      <DialogContent>
        <LoadingBall />
        {
          message &&
            <div style={{color: SECONDARY_COLORS['40'], fontSize: '22px'}}>{message}</div>
        }
      </DialogContent>
    </Dialog>
  )
}

export default LoaderDialog;
