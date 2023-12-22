import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderChip from '../common/HeaderChip';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import merge from 'lodash/merge'

const RepoVersionChip = ({ version, sx, onChange }) => {
  const { t } = useTranslation()
  return (
    <HeaderChip labelPrefix={`${t('common.version')}: `} label={version} icon={<VersionIcon color='surface.contrastText' />} sx={merge({backgroundColor: 'surface.main'}, (sx || {}))} deleteIcon={<DownIcon color='surface.contrastText' />} onDelete={onChange} />
  )
}

export default RepoVersionChip;
