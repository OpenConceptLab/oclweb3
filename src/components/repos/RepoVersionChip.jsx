import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderChip from '../common/HeaderChip';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import { find, reject, orderBy, merge } from 'lodash'
import { SURFACE_COLORS } from '../../common/colors'
import VersionsTable from './VersionsTable'

const RepoVersionChip = ({ version, versions, sx, onChange, size, disabledFrom, disabledUntil, compare, originVersion, checkbox }) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOpen = event => setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);
  const onSelect = selected => {
    onChange(selected)
    onClose()
  }

  const getVersions = () => {
    if(!versions?.length)
      return versions
    const head = find(versions, {version: 'HEAD'})
    return [head, ...orderBy(reject(versions, {version: 'HEAD'}), 'created_at', 'desc')]
  }

  const allVersions = getVersions()

  return (
    <React.Fragment>
      <HeaderChip
        id='versions-dropdown'
        labelPrefix={`${t('common.version')}: `}
        label={version?.version}
        icon={<VersionIcon color='surface.contrastText' fontSize='inherit' />}
        sx={merge({backgroundColor: 'surface.main'}, (sx || {}))}
        deleteIcon={<DownIcon color='surface.contrastText' fontSize='inherit' />}
        onDelete={onOpen}
        onClick={onOpen}
        size={size}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        MenuListProps={{
          'aria-labelledby': 'versions-dropdown',
          style: {
            padding: 0,
            maxHeight: '320px',
            minWidth: '650px',
          }
        }}
        PaperProps={{
          style: {
            padding: '12px',
            maxHeight: '320px',
            minWidth: '650px',
            borderRadius: '16px',
            boxShadow: 'none',
            border: '1px solid',
            borderColor: SURFACE_COLORS.nv80,
            background: SURFACE_COLORS.main
          },
        }}
      >
        <VersionsTable
          selected={version}
          versions={allVersions}
          onChange={onSelect}
          bgColor={SURFACE_COLORS.main}
          disabledFrom={disabledFrom}
          disabledUntil={disabledUntil}
          compare={compare}
          originVersion={originVersion}
          checkbox={checkbox}
        />
      </Menu>
    </React.Fragment>
  )
}

export default RepoVersionChip;
