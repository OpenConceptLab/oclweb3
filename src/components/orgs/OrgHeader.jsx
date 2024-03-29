import React from 'react';
import { useTranslation } from 'react-i18next';
import OrgIcon from '@mui/icons-material/AccountBalance';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import HeaderChip from '../common/HeaderChip';
import LocationIcon from '@mui/icons-material/LocationOnOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import { formatWebsiteLink } from '../../common/utils'


const Property = ({icon, value, label}) => {
  return value ? (
    <span style={{width: 'auto', maxWidth: '500px', display: 'flex', alignItems: 'center', marginRight: '16px'}}>
      <span style={{minWidth: 0, marginRight: '4px', display: 'flex'}}>
        {icon}
      </span>
      <Typography sx={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '14px', color: 'secondary.main'}} component="span">
        {label || value}
    </Typography>
    </span>
  ) : null
}

const OrgHeader = ({ org }) => {
  const { t } = useTranslation()
  const style = org.logo_url ? {width: 'calc(100% - 112px)'} : {width: '100%'}
  const iconStyle = {fontSize: '24px', color: 'surface.contrastText'}
  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '8px 8px 0 0', display: 'inline-flex'}}>
      {
        org.logo_url &&
          <div className='col-xs-1' style={{width: '112px', paddingRight: '15px', paddingLeft: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={org.logo_url} className='user-img-medium' style={{objectFit: 'cover'}} />
          </div>
      }
      <div className='col-xs-12 padding-0' style={style}>
        <div className='col-xs-6 padding-0'>
          <HeaderChip label={org.type} icon={<OrgIcon sx={{color: 'surface.contrastText'}} />} />
        </div>
        <div className='col-xs-6 padding-0' style={{textAlign: 'right'}}>
          <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
            <DownloadIcon fontSize='inherit' />
          </IconButton>
          <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
            <BookmarkIcon fontSize='inherit' />
          </IconButton>
          <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
            <ShareIcon fontSize='inherit' />
          </IconButton>
          <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}}>
            {t('common.manage')}
          </Button>
        </div>
        <div className='col-xs-12 padding-0' style={{margin: '4px 0 8px 0'}}>
          <Typography sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{org.name}</Typography>
        </div>
        <div className='col-xs-12 padding-0' style={{margin: '4px 0 8px 0', display: 'inline-flex'}}>
          <Property icon={<LocationIcon sx={iconStyle} />} value={org.location} />
        <Property icon={<LinkIcon sx={iconStyle} />} value={org?.website} label={formatWebsiteLink(org?.website, {color: 'inherit'})} />
        </div>
      </div>
    </Paper>
  )
}

export default OrgHeader;
