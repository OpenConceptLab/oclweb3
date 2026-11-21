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
import { Box, Tooltip } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/GppGoodOutlined'
import { isVerified } from './aboutSections'
import { VERIFIED_COLORS } from './verifiedColors'

// The Verified mark sits inside the version chip, so it reads as the version's, not the repository's (ocl_issues#3025).
// It isn't a link: the chip opens the version picker, whose verified row has the linked chip.
const VerifiedMark = () => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('repo.verification.chip_tooltip')}>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', ml: '8px', px: '6px', height: '22px', borderRadius: '11px', border: '1px solid', borderColor: VERIFIED_COLORS.main, bgcolor: VERIFIED_COLORS.background, color: VERIFIED_COLORS.dark, fontSize: '13px', fontWeight: 500 }}>
        <VerifiedIcon sx={{ fontSize: '15px !important', color: `${VERIFIED_COLORS.dark} !important`, mr: '0 !important', mt: '0 !important' }} />
        {t('repo.verification.verified')}
      </Box>
    </Tooltip>
  )
}

const normalizeVersions = versions => {
  if (Array.isArray(versions))
    return versions

  return []
}

const RepoVersionChip = ({ version, versions, versionsLoading, previewVersions, hasMoreVersions, onLoadMoreVersions, sx, onChange, size, disabledFrom, disabledUntil, compare, originVersion, checkbox, tooltip }) => {
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
    if(!versionList.length)
      return orderVersions(normalizeVersions(previewVersions))

    if(find(versionList, {version: 'HEAD'}))
      return orderVersions(versionList)
    const head = find(normalizeVersions(previewVersions), {version: 'HEAD'})
    return orderVersions(head ? [head, ...versionList] : versionList)
  }

  const allVersions = getVersions()
  const versionLabel = version?.version && isVerified(version) ?
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>{`${t('common.version')}: ${version.version}`}<VerifiedMark /></Box> :
    version?.version
  const showSkeleton = Boolean(versionsLoading) && !normalizeVersions(versions).length

  return (
    <React.Fragment>
      {
        tooltip ?
          <RepoTooltip repo={version}>
            <HeaderChip
              id='versions-dropdown'
              labelPrefix={`${t('common.version')}: `}
              label={versionLabel}
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
          label={versionLabel}
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
          hasMore={hasMoreVersions}
          loadingMore={versionsLoading && Boolean(normalizeVersions(versions).length)}
          onLoadMore={onLoadMoreVersions}
          onNavigate={onClose}
        />
      </Menu>
    </React.Fragment>
  )
}

export default RepoVersionChip;
