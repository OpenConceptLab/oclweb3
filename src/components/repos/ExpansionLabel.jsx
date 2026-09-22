import React from 'react';
import { useTranslation } from 'react-i18next';
import ExpansionIcon from '@mui/icons-material/AspectRatio';
import startCase from 'lodash/startCase'
import { SECONDARY_COLORS } from '../../common/colors'
import HeaderChip from '../common/HeaderChip'
import { formatDate } from '../../common/utils'

const ExpansionLabel = ({ expansion }) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <HeaderChip
        labelPrefix={`${t('repo.expansion')} `}
        label={expansion?.mnemonic || expansion?.id}
        icon={<ExpansionIcon color='surface.contrastText' fontSize='inherit' />}
        sx={{
          backgroundColor: 'surface.main',
          border: 'none',
          padding: 0,
          fontSize: '14px',
          height: '24px',
          marginLeft: '-8px',
          fontWeight: 'bold'
        }}
        size='small'
      />
      <span style={{fontSize: '12px', marginLeft: '-4px', color: SECONDARY_COLORS.main }}>
        {` ${startCase(t('common.updated_on'))} ${formatDate(expansion?.updated_on)}`}
      </span>
    </React.Fragment>
  )
}

export default ExpansionLabel;
