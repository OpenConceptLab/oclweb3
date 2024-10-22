import React from 'react'
import { useTranslation } from 'react-i18next';
import { join, slice } from 'lodash'
import Tooltip from '@mui/material/Tooltip'
import { SECONDARY_COLORS } from '../../common/colors'
import ExternalIdIcon from './ExternalIdIcon'
import { OperationsContext } from '../app/LayoutContext';
import { copyToClipboard } from '../../common/utils'

const ExternalIdLabel = ({ value, style, iconStyle, showFull, valueOnly, valueStyle }) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const getValue = () => {
    let newValue = value
    if(!showFull && value?.length > 11) {
      newValue = join([slice(value, 0, 4).join(''), '...', slice(value, -4).join('')], '');
    }
    return newValue
  }

  const onClick = () => {
    copyToClipboard(value)
    setAlert({message: t('common.copied_to_clipboard'), severity: 'success', duration: 1000})
  }

  return (
    <Tooltip title={t('common.click_to_copy') + ' ' + value}>
      <span style={{display: 'flex', alignItems: 'center', cursor: 'copy', ...style}} onClick={onClick}>
        {
          !valueOnly &&
            <React.Fragment>
              <ExternalIdIcon size='small' sx={{marginTop: '4px', width: '18px', height: '18px', ...iconStyle}} />
              <span style={{marginRight: '4px', fontSize: '12px', colors: SECONDARY_COLORS.main}}>
                {t('concept.form.external_id')}
              </span>
            </React.Fragment>
        }
        <span style={{fontSize: '12px', color: SECONDARY_COLORS['50'], ...valueStyle}}>
          {getValue()}
        </span>
      </span>
    </Tooltip>
  )
}

export default ExternalIdLabel;
