import React from 'react';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import { uniq, compact, has } from 'lodash'
import RepoVersionChip from './RepoVersionChip';
import RepoChip from './RepoChip'
import DotSeparator from '../common/DotSeparator';
import OwnerChip from '../common/OwnerChip';
import { PRIMARY_COLORS } from '../../common/colors';
import { formatDate, currentUserHasAccess } from '../../common/utils';
import RepoManagementList from './RepoManagementList';
import FollowActionButton from '../common/FollowActionButton'
import EntityAttributesDialog from '../common/EntityAttributesDialog'

const RepoHeader = ({repo, owner, versions, onVersionChange, onCreateConceptClick, onCreateMappingClick, onVersionEditClick, essentials, onCreateVersionClick, onDeleteRepoClick, isVersion, onReleaseVersionClick}) => {
  const { t } = useTranslation()
  const [menu, setMenu] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState(false)
  const [viewAll, setViewAll] = React.useState(false)
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
    if(option === 'addConcept')
      onCreateConceptClick()
    if(option === 'addMapping')
      onCreateMappingClick()
    else if (option === 'createVersion')
      onCreateVersionClick()
    else if (option === 'delete')
      onDeleteRepoClick()
    else if (option === 'editVersion')
      onVersionEditClick()
    else if (option === 'release')
      onReleaseVersionClick()
  }

  const getRepo = () => {
    if(repo?.id) {
      const {default_locale, supported_locales} = repo
      repo.locales = uniq(compact([default_locale, ...(supported_locales || [])]))
    }
    return repo
  }

  const hasAccess = currentUserHasAccess()

  return (
    <Paper component="div" className='col-xs-12' sx={{backgroundColor: 'surface.main', boxShadow: 'none', padding: '16px', borderRadius: '10px 10px 0 0'}}>
      <div className='col-xs-12 padding-0' style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'auto'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <OwnerChip owner={owner} sx={{background: 'transparent', borderColor: 'surface.light'}} hideType />
          <RepoChip repo={repo} sx={{marginLeft: '12px', background: 'transparent', borderColor: 'surface.light'}} onChange={onVersionChange}  />
          {
            onVersionChange &&
              <RepoVersionChip checkbox version={repo} versions={versions} sx={{marginLeft: '8px', borderRadius: '4px'}} onChange={onVersionChange} />
          }
        </span>
        <span style={{display: 'flex', alignItems: 'center', marginLeft: '16px'}}>
          <FollowActionButton iconButton entity={repo} />
          {
            Boolean(hasAccess && (has(repo, 'source_type') || has(repo, 'collection_type'))) &&
              <React.Fragment>
                <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}} onClick={onMenuOpen} id='repo-manage'>
                  {t('repo.manage')}
                </Button>
                <RepoManagementList isVersion={isVersion} anchorEl={menuAnchorEl} open={menu} onClose={onMenuClose} id='repo-manage' onClick={onManageOptionClick} repo={repo} />
              </React.Fragment>
          }
        </span>
      </div>
      <div className='col-xs-12 padding-0' style={{margin: '8px 0', marginBottom: essentials ? 0 : '8px'}}>
        <Typography component='span' sx={{fontSize: '28px', color: 'surface.dark', fontWeight: 600}}>{repo.name}</Typography>
        {
          repo?.canonical_url &&
            <Typography component='span' sx={{marginLeft: '8px', fontSize: '14px', color: 'secondary.main'}}>{repo.canonical_url}</Typography>
        }
      </div>
      {
        !essentials &&
          <>
            <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', fontSize: '16px'}}>
              <span style={{display: 'flex', alignItems: 'center'}}>
                <a style={{color: PRIMARY_COLORS.main, cursor: 'pointer'}} className='no-anchor-styles' onClick={() => setViewAll(true)}>{t('common.view_all_attributes')}</a>
              </span>
              <DotSeparator margin="0 6px" />
              <span style={{display: 'flex', alignItems: 'center', opacity: 0.7}}>
                {t('common.updated_on')} {formatDate(repo.updated_on)}
              </span>
            </div>
            <EntityAttributesDialog
              fields={{
                name: {label: t('common.name')},
                full_name: {label: t('common.full_name')},
                external_id: {label: t('common.external_id')},
                repo_type: {label: t('repo.repo_type')},
                description: {label: t('common.description')},
                canonical_url: {label: t('url_registry.canonical_url')},
                locales: {label: t('repo.locales')},
                custom_validation_schema: {label: t('repo.custom_validation_schema')},
                public_access: {label: t('common.access_level')},
                identifier: {label: t('repo.identifier'), type: 'json'},
                contact: {label: t('repo.contact'), type: 'json'},
                jurisdiction: {label: t('repo.jurisdiction'), type: 'json'},
                publisher: {label: t('repo.publisher')},
                purpose: {label: t('repo.purpose')},
                copyright: {label: t('repo.copyright')},
                content_type: {label: t('repo.content_type')},
                revision_date: {label: t('repo.revision_date'), type: 'date'},
                experimental: {label: t('repo.experimental')},
                case_sensitive: {label: t('repo.case_sensitive')},
                hierarchy_meaning: {label: t('repo.hierarchy_meaning')},
                compositional: {label: t('repo.compositional')},
                version_needed: {label: t('repo.version_needed')},
                autoid_concept_mnemonic: {label: t('repo.autoid_concept_mnemonic')},
                autoid_concept_external_id: {label: t('repo.autoid_concept_external_id')},
                autoid_concept_name_external_id: {label: t('repo.autoid_concept_name_external_id')},
                autoid_concept_description_external_id: {label: t('repo.autoid_concept_description_external_id')},
                autoid_mapping_mnemonic: {label: t('repo.autoid_mapping_mnemonic')},
                autoid_mapping_external_id: {label: t('repo.autoid_mapping_external_id')},
                'checksums.standard': {label: t('checksums.standard')},
                'checksums.smart': {label: t('checksums.smart')},
                extras: {label: t('custom_attributes.label'), type: 'json'},
                created_on: {label: t('common.created_on'), type: 'datetime'},
                updated_on: {label: t('common.updated_on'), type: 'datetime'},
                created_by: {label: t('common.created_by'), type: 'user'},
                updated_by: {label: t('common.updated_by'), type: 'user'},
              }}
              entity={getRepo()}
              open={viewAll}
              onClose={() => setViewAll(false)}
            />
          </>
      }
    </Paper>
)
}

export default RepoHeader;
