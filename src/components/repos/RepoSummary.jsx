import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Button from '@mui/material/Button';
import ExperimentalIcon from '@mui/icons-material/ScienceOutlined';
import LanguageIcon from '@mui/icons-material/TranslateOutlined';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import ConceptClassIcon from '@mui/icons-material/CategoryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { uniq, compact, isEmpty } from 'lodash'

import APIService from '../../services/APIService'
import { currentUserHasAccess, pluralize, formatDate } from '../../common/utils'
import { PRIMARY_COLORS } from '../../common/colors';
import { OperationsContext } from '../app/LayoutContext';
import AccessChip from '../common/AccessChip'
import EntityAttributesDialog from '../common/EntityAttributesDialog'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'

const SkeletonText = () => (<Skeleton width={60} variant='text' />)


const PropertyChip = ({label, icon, ...rest}) => {
  return (
    <Chip
      size='small'
      variant='outlined'
      icon={icon || undefined}
      label={label ? label : <SkeletonText />}
      {...rest}
    />
  )
}

const RepoSummary = ({ repo, summary }) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const [viewAll, setViewAll] = React.useState(false)

  const repoSubType = repo?.source_type || repo?.collection_type
  const isLoaded = isEmpty(summary)
  const activeConcepts = isLoaded ? false : (summary?.concepts?.active || 0)
  const totalConcepts = isLoaded ? false : ((summary?.concepts?.active || 0) + (summary?.concepts?.retired || 0))
  const activeMappings = isLoaded ? false : (summary?.mappings?.active || 0)
  const totalMappings = isLoaded ? false : ((summary?.mappings?.active || 0) + (summary?.mappings?.retired || 0))
  const mapTypes = isLoaded ? false : (summary?.mappings?.map_type?.length || 0)
  const datatypes = isLoaded ? false : (summary?.concepts?.datatype?.length || 0)
  const conceptClasses = isLoaded ? false : (summary?.concepts?.concept_class?.length || 0)
  const nameTypes = isLoaded ? false : (summary?.concepts?.name_type?.length || 0)
  const locales = isLoaded ? false : (summary?.concepts?.locale?.length || 0)
  const totalVersions = isLoaded ? false : (summary?.versions?.total || 0)
  const releasedVersions = isLoaded ? false : (summary?.versions?.released || 0)
  const onRefresh = () => {
    APIService.new().overrideURL(repo.version_url || repo.url).appendToUrl('summary/').put().then(() => {
      setAlert({message: t('repo.repo_summary_is_calculating')})
    })
  }
  const getRepo = () => {
    if(repo?.id) {
      const {default_locale, supported_locales} = repo
      repo.locales = uniq(compact([default_locale, ...(supported_locales || [])]))
    }
    return repo
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div>
        {
          repoSubType ?
            <PropertyChip label={repoSubType} sx={{margin: '4px 8px 4px 0'}} /> :
          null
        }
        {
          repo?.id &&
            <AccessChip sx={{margin: '4px 8px 4px 0'}} public_access={repo?.public_access} />
        }
        {
          repo?.experimental ?
            <PropertyChip sx={{margin: '4px 8px 4px 0'}} label={t('repo.experimental')} icon={<ExperimentalIcon fontSize='inherit' />} /> :
          null
        }
      </div>
      <div style={{marginTop: '24px'}}>
        <Typography sx={{color: '#000', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>
          {t('repo.repo_version_summary')}
        </Typography>
        <List dense sx={{padding: 0}}>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
            </ListItemIcon>
            <ListItemText
              primary={
                totalConcepts === false ?
                  <SkeletonText /> :
                  <Trans
                    i18nKey='repo.summary_active_concepts_from_total'
                    values={{active: activeConcepts?.toLocaleString(), retired: ((totalConcepts || 0) - (activeConcepts || 0))?.toLocaleString()}}
                  />
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <MappingIcon fontSize='small' color='secondary' />
            </ListItemIcon>
            <ListItemText
              primary={
                totalMappings === false ?
                  <SkeletonText /> :
                  <Trans
                    i18nKey='repo.summary_active_mappings_from_total'
                    values={{active: activeMappings?.toLocaleString(), retired: ((totalMappings || 0) - (activeMappings || 0))?.toLocaleString()}}
                  />
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <LanguageIcon fontSize='small' color='secondary' style={{fontSize: '1rem'}} />
            </ListItemIcon>
            <ListItemText
              primary={
                locales === false ?
                  <SkeletonText /> :
                  <>{pluralize(locales, t('repo.locale'), t('repo.locales'))}</>
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <ConceptClassIcon fontSize='small' color='secondary' />
            </ListItemIcon>
            <ListItemText
              primary={
                conceptClasses === false ?
                  <SkeletonText /> :
                  <>{pluralize(conceptClasses, t('concept.concept_class'), t('concept.concept_classes'))}</>
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
            </ListItemIcon>
            <ListItemText
              primary={
                datatypes === false ?
                  <SkeletonText /> :
                  <>{pluralize(datatypes, t('concept.datatype'), t('concept.datatypes'))}</>
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
            </ListItemIcon>
            <ListItemText
              primary={
                nameTypes === false ?
                  <SkeletonText /> :
                  <>{pluralize(nameTypes, t('concept.name_types'), t('concept.name_types'))}</>
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
              <MappingIcon fontSize='small' color='secondary' />
            </ListItemIcon>
            <ListItemText
              primary={
                mapTypes === false ?
                  <SkeletonText /> :
                  <>{pluralize(mapTypes, t('mapping.map_type'), t('mapping.map_types'))}</>
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          {
            !isEmpty(summary?.references) &&
              <>
                <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
                  <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                    <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      totalConcepts === false ?
                        <SkeletonText /> :
                        <Trans
                          i18nKey='repo.summary_concepts_references'
                          values={{count: summary.references.concepts?.toLocaleString()}}
                        />
                    }
                    sx={{
                      '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                    }}
                  />
                </ListItem>
                <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
                  <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                    <MappingIcon fontSize='small' color='secondary' />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      totalMappings === false ?
                        <SkeletonText /> :
                        <Trans
                          i18nKey='repo.summary_mappings_references'
                          values={{count: summary.references.mappings?.toLocaleString()}}
                        />
                    }
                    sx={{
                      '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                    }}
                  />
                </ListItem>
              </>
          }
          {
            totalVersions > 0 &&
              <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
                <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                  <VersionIcon fontSize='small' color='secondary' sx={{fontSize: '1rem'}} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    totalVersions === false ?
                      <SkeletonText /> :
                      <Trans
                        i18nKey='repo.summary_released_versions_from_total'
                        values={{released: releasedVersions?.toLocaleString(), unreleased: ((totalVersions || 0) - (releasedVersions || 0))?.toLocaleString()}}
                      />
                  }
                  sx={{
                    '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                  }}
                />
              </ListItem>
          }
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <ListItemText
              primary={
                repo?.updated_on ?
                  <>
                    {t('common.updated_on')} {formatDate(repo.updated_on)}
                  </> :
                  <SkeletonText />
              }
              sx={{
                '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
              }}
            />
          </ListItem>
          <ListItem sx={{padding: '4px 0', fontSize: '12px'}}>
            <a style={{color: PRIMARY_COLORS.main, cursor: 'pointer'}} className='no-anchor-styles' onClick={() => setViewAll(true)}>{t('common.view_all_attributes')}</a>
          </ListItem>
        </List>

        {
          onRefresh && currentUserHasAccess() &&
            <Button
              color='primary'
              variant='text'
              startIcon={<RefreshIcon fontSize='inherit'/>}
              size='small'
              sx={{marginTop: '4px', marginLeft: '-4px', fontSize: '12px', textTransform: 'none', '.MuiButton-startIcon': {marginRight: '2px'}}}
              onClick={onRefresh}
            >
              {t('repo.refresh_summary')}
            </Button>
        }
      </div>
      <EntityAttributesDialog
        fields={{
          name: {label: t('common.name')},
          full_name: {label: t('common.full_name')},
          external_id: {label: t('common.external_id')},
          repo_type: {label: t('repo.repo_type')},
          description: {label: t('common.description')},
          canonical_url: {label: t('url_registry.canonical_url')},
          locales: {label: t('repo.locales'), type: 'locales-list'},
          custom_validation_schema: {label: t('repo.custom_validation_schema')},
          public_access: {label: t('common.access_level')},
          properties: {label: t('repo.properties'), type: 'table'},
          filters: {label: t('repo.filters'), type: 'table'},
          meta: {label: t('repo.meta'), type: 'json'},
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
    </div>
  )
}

export default RepoSummary
