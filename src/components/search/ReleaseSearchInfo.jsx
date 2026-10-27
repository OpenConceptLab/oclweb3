import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import InfoIcon from '@mui/icons-material/InfoOutlined'
import { GLOBAL_SEARCH_DOC_LINK } from '../../common/constants'

// Says why a global search can miss a source (see isReleaseOnlySearch). The icon links to the same docs page as the
// tooltip's link, so keyboard and touch users, who can't reach a link inside a tooltip, get there too.
const ReleaseSearchInfo = () => {
  const { t } = useTranslation()
  return (
    <Tooltip
      describeChild
      disableTouchListener
      title={
        <Trans
          i18nKey='search.release_search_tooltip'
          components={[<a key='link' href={GLOBAL_SEARCH_DOC_LINK} target='_blank' rel='noopener noreferrer' style={{color: 'inherit', textDecoration: 'underline', whiteSpace: 'nowrap'}} />]}
        />
      }
    >
      <IconButton
        aria-label={t('search.release_search_tooltip_label')}
        href={GLOBAL_SEARCH_DOC_LINK}
        target='_blank'
        rel='noopener noreferrer'
        sx={{marginLeft: '4px', padding: '4px', fontSize: '1rem', verticalAlign: 'middle', '&, &:hover, &:focus': {color: 'action.active'}}}
      >
        <InfoIcon fontSize='inherit' />
      </IconButton>
    </Tooltip>
  )
}

export default ReleaseSearchInfo
