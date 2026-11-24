import React from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from '@mui/material/Tooltip'
import LockIcon from '@mui/icons-material/LockOutlined'

import { getLocks, getLockTooltip, isEntryPointLocked } from './limitNoticePayload'

// The write actions a repository's notices lock (limitNoticePayload.js ENTRY_POINT_ACTIONS), for the controls on its
// page. Outside a repository page nothing is locked.
export const NoticeLocksContext = React.createContext({locks: [], tooltip: null})

export const NoticeLocksProvider = ({ notices, children }) => {
  const value = React.useMemo(() => ({locks: getLocks(notices), tooltip: getLockTooltip(notices)}), [notices])
  return <NoticeLocksContext.Provider value={value}>{children}</NoticeLocksContext.Provider>
}

// lockFor(entryPoint) is the reason an entry point is locked, or null when it isn't
export const useNoticeLocks = () => {
  const { t } = useTranslation()
  const { locks, tooltip } = React.useContext(NoticeLocksContext)
  return React.useCallback(
    entryPoint => isEntryPointLocked(locks, entryPoint) ? (tooltip || t('notice.read_only')) : null,
    [locks, tooltip, t]
  )
}

// A locked control is disabled and says why on hover. A disabled control emits no pointer events, so the tooltip goes
// on a wrapping span (display block inside a menu, so it adds no gaps between rows).
export const LockTooltip = ({ title, children, placement = 'left', display = 'block' }) => title ?
  <Tooltip title={title} placement={placement}>
    <span style={{display}}>{children}</span>
  </Tooltip> :
  children

export const LockMark = ({ sx }) => <LockIcon fontSize='small' sx={{ml: 'auto', pl: 1.5, boxSizing: 'content-box', color: 'secondary.main', ...sx}} />
