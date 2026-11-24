import React from 'react'
import Box from '@mui/material/Box'

import LimitNotice from '../common/LimitNotice'
import { useAccountNotices } from '../common/useNotices'
import usePublishedHeight from '../common/usePublishedHeight'

// The signed-in person's account notices (OpenConceptLab/ocl_online#702), fixed under the announcement banner and above
// the app bar on every page while they last: they can't be closed. Header moves the app bar down by
// --account-notice-height, and index.scss takes it off --app-height. However many there are, they take at most 40% of
// the viewport and scroll within it, so the app bar and the page stay usable.
const AccountNotices = () => {
  const notices = useAccountNotices()
  const ref = usePublishedHeight('--account-notice-height', notices.length > 0)

  if(!notices.length)
    return null

  // mui-fixed lets MUI's scroll lock pad it like the app bar when a modal opens
  return (
    <Box
      ref={ref}
      className='mui-fixed'
      sx={{position: 'fixed', top: 'var(--announcement-height, 0px)', left: 0, right: 0, zIndex: theme => theme.zIndex.drawer + 1, maxHeight: '40vh', overflowY: 'auto'}}
    >
      {notices.map((notice, index) => <LimitNotice key={index} size='strip' notice={notice} sx={{pl: {xs: 2, sm: 3}}} />)}
    </Box>
  )
}

export default AccountNotices
