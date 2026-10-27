import React from 'react'
import { useTranslation } from 'react-i18next'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/InfoOutlined'

// Says why a global search can miss a source (see isReleaseOnlySearch). Hover and keyboard focus open it
// as any tooltip; a tap opens it until the next tap elsewhere, where MUI would wait for a long press.
const ReleaseSearchInfo = () => {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <span>
        <Tooltip
          describeChild
          disableTouchListener
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          title={t('search.release_search_tooltip')}
        >
          <IconButton
            aria-label={t('search.release_search_tooltip_label')}
            onClick={() => setOpen(true)}
            sx={{marginLeft: '4px', padding: '4px', fontSize: '1rem', verticalAlign: 'text-bottom'}}
          >
            <InfoIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      </span>
    </ClickAwayListener>
  )
}

export default ReleaseSearchInfo
