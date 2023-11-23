import React from 'react';
import { Drawer as MuiDrawer } from '@mui/material';

const Drawer = props => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setOpen(props.isOpen)
  }, [props.isOpen])

  const _onClose = () => {
    setOpen(false)
    props.onClose()
  }
  return (
    <MuiDrawer
      ModalProps={{keepMounted: false}}
      anchor={props.anchor || 'right'}
      open={open}
      onClose={_onClose}
      sx={{
        zIndex: '1202',
        '& .MuiDrawer-paper': { minWidth: '360px', borderRadius: '16px', padding: '12px' },
      }}
    >
      { props.children }
    </MuiDrawer>
  )
}

export default Drawer
