import React from 'react';
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider'
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import CompanyIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import { formatWebsiteLink, currentUserHasAccess, isLoggedIn } from '../../common/utils'
import Link from '../common/Link'
import EntityAttributesDialog from '../common/EntityAttributesDialog'
import FollowActionButton from '../common/FollowActionButton'
import RepoIcon from '../repos/RepoIcon'
import OrgIcon from './OrgIcon';


const Property = ({icon, value, label}) => {
  return (label || value) ? (
    <span style={{display: 'flex', alignItems: 'center', marginRight: '16px'}}>
      <span style={{minWidth: 0, marginRight: '4px', display: 'flex'}}>
        {icon}
      </span>
      <Typography sx={{maxWidth: '200px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '14px', color: 'secondary.main'}} component="span">
        {label || value}
      </Typography>
    </span>
  ) : null
}

const OrgHeader = ({ org }) => {
  const { t } = useTranslation()
  const history = useHistory()

  const [viewAll, setViewAll] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const style = org.logo_url ? {width: 'calc(100% - 112px)'} : {width: '100%'}
  const iconStyle = {fontSize: '24px', color: 'surface.contrastText'}

  const handleManageClick = event => anchorEl ? setAnchorEl(null) : setAnchorEl(event.currentTarget);
  const handleNewRepoCreateClick = () => {
    history.push(org.url + 'repos/new')
  }

  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '8px 8px 0 0', display: 'inline-flex'}}>
      {
        org.logo_url &&
          <div className='col-xs-1' style={{width: '112px', paddingRight: '15px', paddingLeft: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={org.logo_url} className='user-img-medium' style={{objectFit: 'cover'}} />
          </div>
      }
      <div className='col-xs-12 padding-0' style={style}>
        <div className='col-xs-8 padding-0' style={{margin: '4px 0 8px 0'}}>
          <Typography sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{org.name}</Typography>
        </div>
        {
          isLoggedIn() &&
            <div className='col-xs-4 padding-0' style={{textAlign: 'right'}}>
              <FollowActionButton iconButton entity={org} />
              {
                currentUserHasAccess() &&
                  <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={handleManageClick}>
                    {t('common.manage')}
                  </Button>
              }
            </div>
        }
        <div className='col-xs-12 padding-0' style={{margin: '4px 0 8px 0', display: 'inline-flex'}}>
          <Property icon={<OrgIcon strict noLink sx={iconStyle} />} value={org.id} />
          <Property icon={<LocationIcon sx={iconStyle} />} value={org.location} />
          <Property icon={<LinkIcon sx={iconStyle} />} value={org?.website} label={formatWebsiteLink(org?.website, {color: 'inherit'})} />
          <Property icon={<CompanyIcon sx={iconStyle} />} value={org?.company} />
          <Property label={<Link sx={{fontSize: '14px'}} label={t('common.view_all_attributes')} onClick={() => setViewAll(true)} />} />
        </div>
      </div>
      <EntityAttributesDialog
        fields={{
          company: {label: t('user.company')},
          extras: {label: t('custom_attributes.label'), type: 'json'},
          created_on: {label: t('common.created_on'), type: 'datetime'},
          updated_on: {label: t('common.updated_on'), type: 'datetime'},
          created_by: {label: t('common.created_by'), type: 'user'},
          updated_by: {label: t('common.updated_by'), type: 'user'},
        }}
        entity={org}
        open={viewAll}
        onClose={() => setViewAll(false)}
      />
      <Menu
        sx={{'.MuiPaper-root': {backgroundColor: 'surface.n94'}}}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleManageClick}
      >
        <MenuItem sx={{padding: '8px 12px'}} disabled>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>
        <MenuItem sx={{padding: '8px 12px'}} onClick={handleNewRepoCreateClick}>
          <ListItemIcon>
            <RepoIcon noTooltip />
          </ListItemIcon>
          <ListItemText>{t('repo.new_repo')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem sx={{padding: '8px 12px'}} disabled>
          <ListItemIcon>
            <DeleteIcon color='error' />
          </ListItemIcon>
          <ListItemText sx={{color: 'error.main'}}>{t('common.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  )
}

export default OrgHeader;
