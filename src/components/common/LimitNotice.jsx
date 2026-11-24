import React from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import CloseIcon from '@mui/icons-material/Close'
import ErrorIcon from '@mui/icons-material/ErrorOutlineOutlined'
import GroupIcon from '@mui/icons-material/GroupOutlined'
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import LockIcon from '@mui/icons-material/LockOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import OrganizationIcon from '@mui/icons-material/CorporateFareOutlined'
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined'
import ResetIcon from '@mui/icons-material/EventRepeatOutlined'
import RestrictedIcon from '@mui/icons-material/DoNotDisturbOnOutlined'
import WarningIcon from '@mui/icons-material/WarningAmberOutlined'

import { COLORS } from '../../common/colors'
import Dialog from './Dialog'
import DialogTitle from './DialogTitle'
import { getNotice, getNoticeIcon, getNoticeTone, orderActions } from './limitNoticePayload'

// LimitNotice is the one slot a connected service fills with a finished notice (limitNoticePayload.js): a dialog at the
// point of a refusal, a strip while a state lasts, or an inline notice inside a form. It renders each field only if
// it was sent. With no notice it shows the API's `detail` alone.

// Tints for the tones the payload sends. The design system has no warning tokens and no error tints past error.95,
// so those use MUI's default warning and the Material 3 error tones.
const WARNING_MAIN = '#ed6c02'
const TONES = {
  info: {main: COLORS.primary.main, bg: COLORS.primary['95'], border: COLORS.primary['80'], track: COLORS.primary['90']},
  warning: {main: WARNING_MAIN, bg: '#fff4e5', border: '#f6c28b', track: '#fde3c8'},
  error: {main: COLORS.error.main, bg: COLORS.error['95'], border: '#f2b8b5', track: '#ffdad6'},
}
const STILL_WORKS_COLOR = '#2e7d32'

const ICONS = {lock: LockIcon, info: InfoIcon, warning: WarningIcon, error: ErrorIcon}
const SCOPE_ICONS = {account: PersonIcon, organization: OrganizationIcon}

// The notice strips fetch again whenever their notices may have changed (useNotices.js): after any refusal shown with
// a notice, and after a write that can change them (a repository's visibility, a deletion)
export const NOTICES_CHANGED_EVENT = 'ocl:limit-notices-changed'
export const refreshNotices = () => window.dispatchEvent(new Event(NOTICES_CHANGED_EVENT))

// The notice a refusal carries, or null. Taking one tells the notice strips to fetch again.
export const takeRefusalNotice = value => {
  const notice = getNotice(value)
  if(notice)
    refreshNotices()
  return notice
}

// Shows a notice in the app's notice dialog (RefusalNoticeDialog, in Header) and refreshes the strips
const NOTICE_SHOW_EVENT = 'ocl:limit-notice-show'
export const showNotice = notice => {
  refreshNotices()
  window.dispatchEvent(new CustomEvent(NOTICE_SHOW_EVENT, {detail: notice}))
}

// Shows a refused write's notice in that dialog. True when the refusal carried one, so the caller skips its own error;
// false leaves the caller's error path as it was.
export const showRefusalNotice = value => {
  const notice = getNotice(value)
  if(notice)
    showNotice(notice)
  return Boolean(notice)
}

const isExternal = url => {
  try {
    return new URL(url).origin !== window.location.origin
  } catch(_) {
    return true
  }
}

const Meter = ({ meter, tone, width, height = 8 }) => typeof meter?.fraction === 'number' ?
  <LinearProgress
    variant='determinate'
    value={meter.fraction * 100}
    aria-label={meter.label}
    sx={{
      width: width || '100%',
      height,
      borderRadius: height / 2,
      backgroundColor: TONES[meter.tone || tone].track,
      flexShrink: 0,
      '.MuiLinearProgress-bar': {borderRadius: height / 2, backgroundColor: TONES[meter.tone || tone].main},
    }}
  /> :
  null

const ActionButton = ({ action, size }) => {
  const external = isExternal(action.url)
  const variant = {primary: 'contained', text: 'text'}[action.kind] || 'outlined'
  const color = variant === 'contained' ? 'primary.contrastText' : 'primary.main'
  return (
    <Button
      href={action.url}
      variant={variant}
      size='small'
      {...(external ? {target: '_blank', rel: 'noopener noreferrer', endIcon: <OpenInNewIcon />} : {})}
      sx={{
        textTransform: 'none',
        borderRadius: '100px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxShadow: 'none',
        ...(size === 'dialog' ? {px: 2.5, fontSize: '14px'} : {px: 1.5, py: size === 'strip' ? '1px' : '3px', fontSize: '13px'}),
        ...(variant === 'outlined' ? {backgroundColor: 'rgba(255, 255, 255, 0.7)'} : {}),
        '.MuiButton-endIcon': {ml: 0.75, '& > *:nth-of-type(1)': {fontSize: '16px'}},
        '&, &:hover, &:focus, &:active': {color, textDecoration: 'none'},
        '&:focus:not(:focus-visible)': {outline: 'none'},
      }}
    >
      {action.label}
    </Button>
  )
}

const HelpLink = ({ help, size }) => (
  <Link
    href={help.url}
    {...(isExternal(help.url) ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
    sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: size === 'strip' ? '13px' : '13.5px', fontWeight: 500, color: 'primary.main', textDecoration: 'none', '&:hover, &:focus': {color: 'primary.main'}}}
  >
    {size !== 'strip' && <HelpIcon sx={{fontSize: '17px'}} />}
    {help.label}
  </Link>
)

const Actions = ({ notice, size }) => {
  if(!notice.actions && !notice.help)
    return null
  const buttons = orderActions(notice.actions, size).map((action, index) => <ActionButton key={index} action={action} size={size} />)
  const help = notice.help ? <HelpLink help={notice.help} size={size} /> : null
  if(size === 'dialog')
    return (
      <DialogActions disableSpacing sx={{p: 0, pt: 3, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', flexDirection: {xs: 'column-reverse', sm: 'row'}, alignItems: {xs: 'stretch', sm: 'center'}}}>
        {help && <Box sx={{mr: {sm: 'auto'}, alignSelf: {xs: 'center', sm: 'auto'}, mt: {xs: 0.75, sm: 0}}}>{help}</Box>}
        {buttons}
      </DialogActions>
    )
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: size === 'strip' ? 0.75 : 1, flexWrap: 'wrap', mt: size === 'strip' ? '3px' : 0}}>
      {buttons}
      {help && <Box sx={{ml: 0.5}}>{help}</Box>}
    </Box>
  )
}

const Scope = ({ notice, sx }) => {
  if(!notice.scope)
    return null
  const ScopeIcon = SCOPE_ICONS[notice.scope_type] || PersonIcon
  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: '13px', color: 'secondary.main', ...sx}}>
      <ScopeIcon sx={{fontSize: '17px'}} />
      <span>{notice.scope}</span>
    </Box>
  )
}

const Reset = ({ notice, fontSize = '13px' }) => notice.reset ?
  <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.75, fontSize, color: 'surface.contrastText'}}>
    <ResetIcon sx={{fontSize: '17px', color: 'secondary.main', mt: '1px'}} />
    <span>{notice.reset}</span>
  </Box> :
  null

// What's restricted, what still works and who can act on it, with a label in a dialog
const Rows = ({ notice, tone, withLabels, fontSize, iconSize }) => {
  const { t } = useTranslation()
  const rows = [
    notice.restricted && {key: 'restricted', Icon: notice.kind === 'read_only' ? LockIcon : RestrictedIcon, color: TONES[tone].main, label: t('notice.restricted'), text: notice.restricted},
    notice.still_works && {key: 'still_works', Icon: CheckCircleIcon, color: STILL_WORKS_COLOR, label: t('notice.still_works'), text: notice.still_works},
    notice.managed_by && {key: 'managed_by', Icon: GroupIcon, color: 'secondary.main', text: notice.managed_by},
  ].filter(Boolean)
  return rows.map(({ key, Icon, color, label, text }) => (
    <Box key={key} sx={{display: 'flex', gap: 1.25, alignItems: 'flex-start', fontSize, lineHeight: 1.5}}>
      <Icon sx={{fontSize: iconSize, color, mt: '1px', flexShrink: 0}} />
      <div>
        {withLabels && label && <Box component='span' sx={{display: 'block', fontSize: '12px', fontWeight: 700, color: 'secondary.main', mb: '1px'}}>{label}</Box>}
        {text}
      </div>
    </Box>
  ))
}

const NoticeIcon = ({ notice, tone, size }) => {
  const Icon = notice ? ICONS[getNoticeIcon(notice)] : InfoIcon
  return <Icon sx={{fontSize: size, color: TONES[tone].main, flexShrink: 0, mt: '1px'}} />
}

const NoticeDialog = ({ open, onClose, ...props }) => {
  const { t } = useTranslation()
  // while it closes, the dialog keeps what it showed: its owner may already have cleared the notice
  const shown = React.useRef(props)
  if(open)
    shown.current = props
  const { notice, detail } = shown.current
  const tone = getNoticeTone(notice)
  return (
    <Dialog open={Boolean(open)} onClose={onClose} maxWidth='sm' fullWidth aria-labelledby='limit-notice-title'>
      <DialogTitle id='limit-notice-title'>
        <Box component='span' sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5}}>
          <span>{notice ? notice.title : t('notice.request_not_completed')}</span>
          <IconButton onClick={onClose} aria-label={t('common.close')} sx={{mt: '-6px', mr: '-10px'}}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{p: 0}}>
        {
          notice ?
            <React.Fragment>
              <Scope notice={notice} sx={{mt: 1}} />
              {
                Boolean(notice.meter || notice.reset) &&
                  <Box sx={{mt: 2, backgroundColor: 'white', borderRadius: '16px', px: 2, py: 1.75, display: 'flex', flexDirection: 'column', gap: 1}}>
                    {
                      notice.meter &&
                        <React.Fragment>
                          {notice.meter.label && <Typography sx={{fontSize: '15px', fontWeight: 500, color: 'surface.dark', fontVariantNumeric: 'tabular-nums'}}>{notice.meter.label}</Typography>}
                          <Meter meter={notice.meter} tone={tone} />
                        </React.Fragment>
                    }
                    <Reset notice={notice} />
                  </Box>
              }
              {
                Boolean(notice.restricted || notice.still_works || notice.managed_by) &&
                  <Box sx={{mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, color: 'surface.contrastText'}}>
                    <Rows notice={notice} tone={tone} withLabels fontSize='14.5px' iconSize='20px' />
                  </Box>
              }
            </React.Fragment> :
            <Typography sx={{mt: 2, fontSize: '15px', color: 'surface.dark', lineHeight: 1.5}}>{detail}</Typography>
        }
      </DialogContent>
      {
        notice && (notice.actions || notice.help) ?
          <Actions notice={notice} size='dialog' /> :
          <DialogActions sx={{p: 0, pt: 3}}>
            <Button onClick={onClose} sx={{textTransform: 'none', borderRadius: '100px'}}>{t('common.close')}</Button>
          </DialogActions>
      }
    </Dialog>
  )
}

const NoticeStrip = ({ notice, detail, sx }) => {
  const tone = getNoticeTone(notice)
  const colors = TONES[tone]
  const texts = notice ? [notice.restricted, notice.still_works, notice.managed_by].filter(Boolean) : []
  const hasActions = Boolean(notice?.actions || notice?.help)
  const compact = !texts.length && !hasActions
  return (
    <Box
      role='status'
      sx={{
        display: 'flex', gap: 1.5, alignItems: compact ? 'center' : 'flex-start',
        backgroundColor: colors.bg, borderBottom: `1px solid ${colors.border}`,
        pt: compact ? 0.75 : 1, pb: compact ? 0.75 : '9px', pl: {xs: 1.5, sm: 2}, pr: {xs: 1.25, sm: 2},
        overflowWrap: 'anywhere', ...sx,
      }}
    >
      <NoticeIcon notice={notice} tone={tone} size='21px' />
      <Box sx={{flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px'}}>
        {
          notice ?
            <Box sx={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.75}}>
              <Typography component='span' sx={{fontWeight: 600, fontSize: '14px', color: 'surface.dark'}}>{notice.title}</Typography>
              {notice.scope && <Typography component='span' sx={{fontSize: '12.5px', color: 'secondary.main'}}>{notice.scope}</Typography>}
              {
                notice.meter &&
                  <Box component='span' sx={{display: 'inline-flex', alignItems: 'center', gap: 1}}>
                    <Meter meter={notice.meter} tone={tone} width={{xs: 90, sm: 120}} height={6} />
                    {notice.meter.label && <Typography component='span' sx={{fontSize: '12.5px', fontWeight: 500, color: 'surface.dark', fontVariantNumeric: 'tabular-nums'}}>{notice.meter.label}</Typography>}
                  </Box>
              }
              {notice.reset && <Typography component='span' sx={{fontSize: '12.5px', color: 'surface.contrastText'}}>{notice.reset}</Typography>}
            </Box> :
            <Typography sx={{fontSize: '13.5px', color: 'surface.contrastText'}}>{detail}</Typography>
        }
        {texts.length > 0 && <Typography sx={{fontSize: '13.5px', color: 'surface.contrastText', lineHeight: 1.45}}>{texts.join(' ')}</Typography>}
        {hasActions && <Actions notice={notice} size='strip' />}
      </Box>
    </Box>
  )
}

const NoticeInline = ({ notice, detail, sx }) => {
  const tone = getNoticeTone(notice)
  const colors = TONES[tone]
  return (
    <Box
      role='status'
      sx={{display: 'flex', gap: 1.5, alignItems: 'flex-start', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, borderRadius: '12px', px: {xs: 1.5, sm: 1.75}, py: {xs: 1.25, sm: 1.5}, overflowWrap: 'anywhere', ...sx}}
    >
      <NoticeIcon notice={notice} tone={tone} size='22px' />
      <Box sx={{flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, color: 'surface.contrastText'}}>
        {
          notice ?
            <React.Fragment>
              <Typography sx={{fontWeight: 600, fontSize: '14.5px', lineHeight: 1.35, color: 'surface.dark'}}>{notice.title}</Typography>
              <Scope notice={notice} sx={{fontSize: '12.5px', mt: -0.5}} />
              {
                Boolean(notice.meter || notice.reset) &&
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    {notice.meter?.label && <Typography sx={{fontSize: '13px', fontWeight: 500, color: 'surface.dark', fontVariantNumeric: 'tabular-nums'}}>{notice.meter.label}</Typography>}
                    {notice.meter && <Meter meter={notice.meter} tone={tone} />}
                    <Reset notice={notice} fontSize='12.5px' />
                  </Box>
              }
              <Rows notice={notice} tone={tone} fontSize='13.5px' iconSize='18px' />
              <Actions notice={notice} size='inline' />
            </React.Fragment> :
            <Typography sx={{fontSize: '13.5px', lineHeight: 1.45}}>{detail}</Typography>
        }
      </Box>
    </Box>
  )
}

/**
 * <LimitNotice size='dialog' | 'strip' | 'inline' notice={normalized notice or null} detail={API detail} />
 * A dialog also takes open and onClose.
 */
const LimitNotice = ({ size = 'dialog', notice, detail, ...rest }) => {
  if(size === 'strip')
    return <NoticeStrip notice={notice} detail={detail} {...rest} />
  if(size === 'inline')
    return <NoticeInline notice={notice} detail={detail} {...rest} />
  return <NoticeDialog notice={notice} detail={detail} {...rest} />
}

// The one dialog for refused writes that carry a notice (showRefusalNotice), mounted once in Header
export const RefusalNoticeDialog = () => {
  const [notice, setNotice] = React.useState(null)
  React.useEffect(() => {
    const onShow = event => setNotice(event.detail)
    window.addEventListener(NOTICE_SHOW_EVENT, onShow)
    return () => window.removeEventListener(NOTICE_SHOW_EVENT, onShow)
  }, [])
  return <LimitNotice size='dialog' open={Boolean(notice)} notice={notice} onClose={() => setNotice(null)} />
}

export default LimitNotice
