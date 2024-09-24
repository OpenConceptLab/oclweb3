import React from 'react';
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import startCase from 'lodash/startCase'
import { SECONDARY_COLORS } from '../../common/colors'
import HeaderChip from '../common/HeaderChip'

const RepoVersionLabel = ({ version }) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <HeaderChip
        labelPrefix={`${t('common.version')} `}
        label={version?.version || version?.id}
        icon={<VersionIcon color='surface.contrastText' fontSize='inherit' />}
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
        {` ${startCase(t('common.updated_on'))} ${moment(version?.updated_on).format('MM/DD/YYYY')}`}
      </span>
    </React.Fragment>
  )
}

export default RepoVersionLabel;
