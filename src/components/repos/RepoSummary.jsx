import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ExperimentalIcon from '@mui/icons-material/ScienceOutlined';
import LanguageIcon from '@mui/icons-material/TranslateOutlined';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';

import isEmpty from 'lodash/isEmpty'

import AccessChip from '../common/AccessChip'
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

  return (
    <div className='col-xs-12 padding-0'>
      <div>
        <PropertyChip label={repo?.source_type || repo?.collection_type} sx={{margin: '4px 8px 4px 0'}} />
        <AccessChip sx={{margin: '4px 8px 4px 0'}} public_access={repo?.public_access} />
        <PropertyChip sx={{margin: '4px 8px 4px 0'}} label={t('repo.experimental')} icon={<ExperimentalIcon fontSize='inherit' />} />
      </div>
      <div style={{marginTop: '24px'}}>
        <Typography sx={{color: '#000', fontSize: '16px', fontWeight: 'bold', marginBottom: '12px'}}>
          {t('common.summary')}
        </Typography>
        <List dense sx={{padding: 0}}>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
              </ListItemIcon>
              <ListItemText
                primary={
                  totalConcepts === false ?
                    <SkeletonText /> :
                    <Trans
                      i18nKey='repo.summary_active_concepts_from_total'
                      values={{active: activeConcepts?.toLocaleString(), total: totalConcepts?.toLocaleString()}}
                    />
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <MappingIcon fontSize='small' color='secondary' />
              </ListItemIcon>
              <ListItemText
                primary={
                  totalMappings === false ?
                    <SkeletonText /> :
                    <Trans
                      i18nKey='repo.summary_active_mappings_from_total'
                      values={{active: activeMappings?.toLocaleString(), total: totalMappings?.toLocaleString()}}
                    />
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
              </ListItemIcon>
              <ListItemText
                primary={
                  datatypes === false ?
                    <SkeletonText /> :
                    <>{`${datatypes?.toLocaleString()} ${t('concept.datatypes')}`}</>
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
              </ListItemIcon>
              <ListItemText
                primary={
                  conceptClasses === false ?
                    <SkeletonText /> :
                    <>{`${conceptClasses?.toLocaleString()} ${t('concept.concept_classes')}`}</>
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <ConceptIcon selected fontSize='small' color='secondary' sx={{width: '14px', height: '14px'}} />
              </ListItemIcon>
              <ListItemText
                primary={
                  nameTypes === false ?
                    <SkeletonText /> :
                    <>{`${nameTypes?.toLocaleString()} ${t('concept.name_types')}`}</>
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <LanguageIcon fontSize='small' color='secondary' style={{fontSize: '1rem'}} />
              </ListItemIcon>
              <ListItemText
                primary={
                  locales === false ?
                    <SkeletonText /> :
                    <>{`${locales?.toLocaleString()} ${t('repo.locales')}`}</>
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <MappingIcon fontSize='small' color='secondary' />
              </ListItemIcon>
              <ListItemText
                primary={
                  mapTypes === false ?
                    <SkeletonText /> :
                    <>{`${mapTypes?.toLocaleString()} ${t('mapping.map_types')}`}</>
                }
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
            </ListItemButton>
          </ListItem>
          {
            totalVersions > 0 &&
              <ListItem disablePadding>
                <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}}>
                  <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                    <VersionIcon fontSize='small' color='secondary' sx={{fontSize: '1rem'}} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      totalVersions === false ?
                        <SkeletonText /> :
                        <Trans
                          i18nKey='repo.summary_released_versions_from_total'
                          values={{released: releasedVersions?.toLocaleString(), total: totalVersions?.toLocaleString()}}
                        />
                    }
                    sx={{
                      '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                    }}
                  />
                </ListItemButton>
              </ListItem>
          }
        </List>
      </div>
    </div>
  )
}

export default RepoSummary
