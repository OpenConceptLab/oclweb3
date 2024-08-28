import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import isNumber from 'lodash/isNumber';
import HeaderChip from '../common/HeaderChip';
import RepoVersionChip from './RepoVersionChip';
import RepoIcon from './RepoIcon';
import DotSeparator from '../common/DotSeparator';
import OwnerIcon from '../common/OwnerIcon';
import { PRIMARY_COLORS } from '../../common/colors';
import { formatDate } from '../../common/utils';
import RepoManagementList from './RepoManagementList';
import FollowActionButton from '../common/FollowActionButton'

const RepoHeader = ({repo, versions, onVersionChange, onCreateConceptClick}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const onMenuOpen = event => {
    setMenuAnchorEl(event.currentTarget)
    setMenu(true)
  }
  const onMenuClose = () => {
    setMenuAnchorEl(false)
    setMenu(false)
  }

  const onManageOptionClick = option => {
    onMenuClose()
    if(option === 'addConcept') {
      onCreateConceptClick()
    }
  }

  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '8px 8px 0 0'}}>
      <div className='col-xs-6 padding-0'>
        <HeaderChip label={repo.type} icon={<RepoIcon sx={{color: 'surface.contrastText'}} />} />
        <RepoVersionChip version={repo} versions={versions} sx={{marginLeft: '8px'}} onChange={onVersionChange} />
      </div>
      <div className='col-xs-6 padding-0' style={{textAlign: 'right'}}>
        <FollowActionButton iconButton entity={repo} />
        <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
          <DownloadIcon fontSize='inherit' />
        </IconButton>
        <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
          <ShareIcon fontSize='inherit' />
        </IconButton>
        <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='repo-manage'>
          {t('repo.manage')}
        </Button>
        <RepoManagementList anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='repo-manage' onClick={onManageOptionClick} />
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '4px 0 8px 0'}}>
        <Typography sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{repo.name}</Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', fontSize: '16px'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerIcon ownerType={repo.ownerType} sx={{marginRight: '8px', color: 'surface.contrastText'}} />
          <a style={{color: PRIMARY_COLORS.main}} className='no-anchor-styles' href={`#${repo.owner_url}`}>{repo.owner}</a>
        </span>
        {
          isNumber(repo?.summary?.active_concepts) &&
            <React.Fragment>
              <DotSeparator margin="0 6px" />
              <span style={{display: 'flex', alignItems: 'center', opacity: 0.7}}>
                {repo.summary.active_concepts.toLocaleString()} {t('concept.concepts')}
              </span>
            </React.Fragment>
        }
        {
          isNumber(repo?.summary?.active_mappings) &&
            <React.Fragment>
              <DotSeparator margin="0 6px" />
              <span style={{display: 'flex', alignItems: 'center', opacity: 0.7}}>
                {repo.summary.active_mappings.toLocaleString()} {t('mapping.mappings')}
              </span>
            </React.Fragment>
        }
        <DotSeparator margin="0 6px" />
        <span style={{display: 'flex', alignItems: 'center'}}>
          <a style={{color: PRIMARY_COLORS.main}} className='no-anchor-styles'>{t('common.view_all_attributes')}</a>
        </span>
        <DotSeparator margin="0 6px" />
        <span style={{display: 'flex', alignItems: 'center', opacity: 0.7}}>
          {t('common.updated_on')} {formatDate(repo.updated_on)}
        </span>
      </div>
    </Paper>
  )
}

export default RepoHeader;
