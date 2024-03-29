import React from 'react'
import { Dialog as MuiDialog } from '@mui/material'

const Dialog = ({children, ...rest}) => {
  return (
    <MuiDialog {...rest} sx={{'.MuiPaper-root': {backgroundColor: 'surface.n92', p: 3, borderRadius: '28px'}}}>
      {children}
    </MuiDialog>
  )
}

export default Dialog
