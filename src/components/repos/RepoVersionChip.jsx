import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderChip from '../common/HeaderChip';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import { find, reject, orderBy, merge, compact } from 'lodash'
import { SURFACE_COLORS } from '../../common/colors'
import VersionsTable from './VersionsTable'
import RepoTooltip from './RepoTooltip'

const normalizeVersions = versions => {
  if (Array.isArray(versions))
    return versions

  return []
}

const RepoVersionChip = ({ version, versions, versionsLoading, previewVersions, sx, onChange, size, disabledFrom, disabledUntil, compare, originVersion, checkbox, tooltip }) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState(null);
  const onOpen = event => setAnchorEl(event.currentTarget);
  const onClose = () => setAnchorEl(null);
  const onSelect = selected => {
    onChange(selected)
    onClose()
  }

  const orderVersions = versionList => {
    const head = find(versionList, {version: 'HEAD'})
    return compact([head, ...orderBy(reject(versionList, {version: 'HEAD'}), 'created_at', 'desc')])
  }

  const getVersions = () => {
    const versionList = normalizeVersions(versions)
    if(versionList.length)
      return orderVersions(versionList)
    // Full versions list hasn't loaded yet -- show whatever we already know
    // (HEAD and/or the latest released version) instead of an empty menu.
    return orderVersions(normalizeVersions(previewVersions))
  }

  const allVersions = getVersions()
  const showSkeleton = Boolean(versionsLoading) && !normalizeVersions(versions).length

  return (
    <React.Fragment>
      {
        tooltip ?
          <RepoTooltip repo={version}>
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
          </RepoTooltip>:
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
      }
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        slotProps={{
          list: {
            'aria-labelledby': 'versions-dropdown',
            style: {
              padding: 0,
              maxHeight: '320px',
              minWidth: '650px',
            }
          },
          paper: {
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
          },
        }}
      >
        <VersionsTable
          selected={version}
          versions={allVersions}
          loading={showSkeleton}
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
