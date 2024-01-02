import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderChip from '../common/HeaderChip';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import merge from 'lodash/merge'
import Menu from '@mui/material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import { find, reject, orderBy, isArray } from 'lodash'
import { formatDateTime } from '../../common/utils'

const RepoVersionChip = ({ version, versions, sx, onChange }) => {
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
        label={version.version}
        icon={<VersionIcon color='surface.contrastText' />}
        sx={merge({backgroundColor: 'surface.main'}, (sx || {}))}
        deleteIcon={<DownIcon color='surface.contrastText' />}
        onDelete={onOpen}
        onClick={onOpen}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        MenuListProps={{
          'aria-labelledby': 'versions-dropdown',
        }}
        PaperProps={{
          style: {
            maxHeight: '300px',
          },
        }}
      >
        {
          isArray(allVersions) ? allVersions.map(_version => {
            const isSelected = version?.version_url ? version.version_url === _version.version_url : version.url === _version.version_url
            return (
              <ListItemButton key={_version.version_url} selected={isSelected} onClick={() => onSelect(_version)}>
                <ListItemIcon sx={{minWidth: '38px'}}>
                  <VersionIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={_version.version} secondary={formatDateTime(_version.created_at)} />
              </ListItemButton>
            )
          }) : null
        }
      </Menu>

    </React.Fragment>
  )
}

export default RepoVersionChip;
