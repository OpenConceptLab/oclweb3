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
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button';
import ExperimentalIcon from '@mui/icons-material/ScienceOutlined';
import LanguageIcon from '@mui/icons-material/TranslateOutlined';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import ConceptClassIcon from '@mui/icons-material/CategoryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import isEmpty from 'lodash/isEmpty'
import without from 'lodash/without'
import map from 'lodash/map'

import APIService from '../../services/APIService'
import { currentUserHasAccess } from '../../common/utils'
import { OperationsContext } from '../app/LayoutContext';
import AccessChip from '../common/AccessChip'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'

const SkeletonText = () => (<Skeleton width={60} variant='text' />)


const CollapsedStatList = ({open, stat}) => {
  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <List dense component="div" sx={{padding: '0 16px'}}>
        {
          map(stat, value => (
            <ListItemButton key={value[0]} sx={{padding: '4px 0', fontSize: '12px'}}>
              <ListItemText
                primary={value[0]}
                sx={{
                  '.MuiListItemText-primary': {fontSize: '12px', color: 'secondary.main'}
                }}
              />
              <Typography component='span' sx={{fontSize: '12px', color: 'secondary.main'}}>
                {value[1]?.toLocaleString()}
              </Typography>
            </ListItemButton>
          ))
        }
      </List>
    </Collapse>
  )
}

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
  const [openStat, setOpenStat] = React.useState([])
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
  const toggleStat = stat => setOpenStat(openStat.includes(stat) ? without(openStat, stat) : [...openStat, stat])
  const onRefresh = () => {
    APIService.new().overrideURL(repo.version_url || repo.url).appendToUrl('summary/').put().then(() => {
      setAlert({message: t('repo.repo_summary_is_calculating')})
    })
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
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}} onClick={() => toggleStat('concept_class')}>
              <ListItemIcon sx={{minWidth: '20px', marginRight: '8px', justifyContent: 'center'}}>
                <ConceptClassIcon fontSize='small' color='secondary' />
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
          <CollapsedStatList stat={summary?.concepts?.concept_class} open={openStat?.includes('concept_class')} />
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}} onClick={() => toggleStat('datatype')}>
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
          <CollapsedStatList stat={summary?.concepts?.datatype} open={openStat?.includes('datatype')} />
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}} onClick={() => toggleStat('name_type')}>
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
          <CollapsedStatList stat={summary?.concepts?.name_type} open={openStat?.includes('name_type')} />
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}} onClick={() => toggleStat('locale')}>
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
          <CollapsedStatList stat={summary?.concepts?.locale} open={openStat?.includes('locale')} />
          <ListItem disablePadding>
            <ListItemButton sx={{padding: '4px 0', fontSize: '12px'}} onClick={() => toggleStat('map_type')}>
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
          <CollapsedStatList stat={summary?.mappings?.map_type} open={openStat?.includes('map_type')} />
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
    </div>
  )
}

export default RepoSummary
