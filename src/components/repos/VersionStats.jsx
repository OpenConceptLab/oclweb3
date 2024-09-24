import React from 'react'
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import LanguageIcon from '@mui/icons-material/Translate';
import uniq from 'lodash/uniq'
import get from 'lodash/get'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'
import RepoVersionLabel from './RepoVersionLabel'

const StatRow = ({icon, label, version1, version2, statKey, statFunc}) => {
  const lastCellStyle = {borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const cellStyle = {borderRight: '1px solid', ...lastCellStyle}
  const getValue = version => {
    if(statFunc)
      return statFunc(version)
    return get(version, `summary.${statKey}`)?.toLocaleString()
  }
  return (
  <TableRow>
    <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
      {icon}
      {label}
    </TableCell>
    <TableCell sx={cellStyle}>
      {
        version1?.id ?
          getValue(version1):
          <Skeleton variant="circular" width={20} height={20} />
      }
    </TableCell>
    <TableCell sx={lastCellStyle}>
      {
        version2?.id ?
          getValue(version2) :
          <Skeleton variant="circular" width={20} height={20} />
      }
    </TableCell>
  </TableRow>
  )
}


const VersionStats = ({version1, version2}) => {
  const { t } = useTranslation()
  const lastCellStyle = {borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const cellStyle = {borderRight: '1px solid', ...lastCellStyle}
  const lastHeadCellStyle = {...lastCellStyle, backgroundColor: 'surface.main'}
  const headCellStyle = {...cellStyle, backgroundColor: 'surface.main'}
  const getLocales = version => {
    let locales = []
    if(version?.default_locale)
      locales.push(version.default_locale)
    locales = uniq([...locales, ...version.supported_locales])
    return locales.join(', ')
  }
  return (
    <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
      <Table size='small' stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell sx={{...headCellStyle, width: '20%'}} />
            <TableCell sx={{...headCellStyle, width: '40%'}}>
              <RepoVersionLabel version={version1} />
            </TableCell>
            <TableCell sx={{...lastHeadCellStyle, width: '40%'}}>
              <RepoVersionLabel version={version2} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StatRow
            label={t('concept.concepts')}
            icon={<ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='active_concepts'
          />
          <StatRow
            label={t('mapping.mappings')}
            icon={<MappingIcon fontSize='small' color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='active_mappings'
          />
          <StatRow
            label={t('common.languages')}
            icon={<LanguageIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statFunc={getLocales}
          />
          <StatRow
            label={t('concept.concept_classes')}
            icon={<ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='concepts.concept_class.length'
          />
          <StatRow
            label={t('concept.datatypes')}
            icon={<ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='concepts.datatype.length'
          />
          <StatRow
            label={t('concept.name_types')}
            icon={<ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='concepts.name_type.length'
          />
          <StatRow
            label={t('concept.retired_concepts')}
            icon={<ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px', color: 'secondary.60'}} />}
            version1={version1}
            version2={version2}
            statKey='concepts.retired'
          />
          <StatRow
            label={t('mapping.map_types')}
            icon={<MappingIcon fontSize='small' color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='mappings.map_type.length'
          />
          <StatRow
            label={t('mapping.to_concept_sources')}
            icon={<MappingIcon fontSize='small' color='secondary' sx={{marginRight: '16px'}} />}
            version1={version1}
            version2={version2}
            statKey='mappings.to_concept_source.length'
          />
          <StatRow
            label={t('mapping.retired_mappings')}
            icon={<MappingIcon fontSize='small' color='secondary' sx={{marginRight: '16px', color: 'secondary.60'}} />}
            version1={version1}
            version2={version2}
            statKey='mappings.retired'
          />
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default VersionStats;
