import React from 'react'
import { useTranslation } from 'react-i18next'
import ListItemButton from '@mui/material/ListItemButton'
import Tooltip from '@mui/material/Tooltip'
import LockIcon from '@mui/icons-material/LockOutlined'

import { getLocks, getLockTooltip, isEntryPointLocked, writesShownVersion } from './limitNoticePayload'

// The write actions a repository's notices lock (limitNoticePayload.js ENTRY_POINT_ACTIONS), for the controls on its
// page: HEAD's notices for what writes to HEAD, the shown version's for what writes to it. Outside a repository page
// nothing is locked.
const toLocks = notices => ({locks: getLocks(notices), tooltip: getLockTooltip(notices)})
const NONE = toLocks([])
export const NoticeLocksContext = React.createContext({head: NONE, shown: NONE})

export const NoticeLocksProvider = ({ notices, shownNotices, children }) => {
  const value = React.useMemo(() => ({head: toLocks(notices), shown: toLocks(shownNotices || notices)}), [notices, shownNotices])
  return <NoticeLocksContext.Provider value={value}>{children}</NoticeLocksContext.Provider>
}

// lockFor(entryPoint) is the reason an entry point is locked, or null when it isn't. A row that writes to a version of
// its own (a Versions row) passes that version's notices, which then decide instead of the page's.
export const useNoticeLocks = notices => {
  const { t } = useTranslation()
  const page = React.useContext(NoticeLocksContext)
  const own = React.useMemo(() => notices ? toLocks(notices) : null, [notices])
  return React.useCallback(entryPoint => {
    const { locks, tooltip } = own || (writesShownVersion(entryPoint) ? page.shown : page.head)
    return isEntryPointLocked(locks, entryPoint) ? (tooltip || t('notice.read_only')) : null
  }, [own, page, t])
}

// A locked control is disabled and says why on hover. A disabled control emits no pointer events, so the tooltip goes
// on a wrapping span (display block inside a menu, so it adds no gaps between rows).
export const LockTooltip = ({ title, children, placement = 'left', display = 'block' }) => title ?
  <Tooltip title={title} placement={placement}>
    <span style={{display}}>{children}</span>
  </Tooltip> :
  children

export const LockMark = ({ sx }) => <LockIcon fontSize='small' sx={{ml: 'auto', pl: 1.5, boxSizing: 'content-box', color: 'secondary.main', ...sx}} />

// A menu item that `lock` (lockFor's reason, or null) disables, with the reason on hover and a lock after its content.
// `as` is the item it renders: a ListItemButton, or a MenuItem.
export const LockableMenuItem = ({ lock, as: Item = ListItemButton, children, ...rest }) =>
  <LockTooltip title={lock}>
    <Item disabled={Boolean(lock)} {...rest}>
      {children}
      {lock && <LockMark />}
    </Item>
  </LockTooltip>
