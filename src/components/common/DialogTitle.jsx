import React from 'react'
import { DialogTitle as MuiDialogTitle } from '@mui/material'

const DialogTitle = ({children, ...rest}) => {
  return (
    <MuiDialogTitle {...rest} sx={{p: 0, fontSize: '24px', lineHeight: 1.33, color: 'surface.dark'}}>
      {children}
    </MuiDialogTitle>
  )
}

export default DialogTitle
