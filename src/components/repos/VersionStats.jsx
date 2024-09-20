import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import VersionIcon from '@mui/icons-material/AccountTreeOutlined';
import LanguageIcon from '@mui/icons-material/Translate';
import startCase from 'lodash/startCase'
import uniq from 'lodash/uniq'
import { SECONDARY_COLORS } from '../../common/colors'
import HeaderChip from '../common/HeaderChip'
import ConceptIcon from '../concepts/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon'

const Version = ({ version }) => {
  const { t } = useTranslation()
  return (
    <React.Fragment>
      <HeaderChip
        labelPrefix={`${t('common.version')} `}
        label={version?.version || version?.id}
        icon={<VersionIcon color='surface.contrastText' fontSize='inherit' />}
        sx={{
          backgroundColor: 'surface.main',
          border: 'none',
          padding: 0,
          fontSize: '14px',
          height: '24px',
          marginLeft: '-8px'
        }}
        size='small'
      />
      <span style={{fontSize: '12px', marginLeft: '-4px', color: SECONDARY_COLORS.main }}>
        {` ${startCase(t('common.updated_on'))} ${moment(version?.updated_on).format('MM/DD/YYYY')}`}
      </span>
    </React.Fragment>
  )}


const VersionStats = ({version1, version2}) => {
  const { t } = useTranslation()
  const cellStyle = {borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const headCellStyle = {...cellStyle, backgroundColor: 'surface.main'}
  const getLocales = version => {
    let locales = []
    if(version?.default_locale)
      locales.push(version.default_locale)
    locales = uniq([...locales, ...version.supported_locales])
    return locales.join(', ')
  }
  return (
    <TableContainer sx={{ maxHeight: 700 }}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell sx={{...headCellStyle, width: '20%'}} />
            <TableCell sx={{...headCellStyle, width: '40%'}}>
              <Version version={version1} />
            </TableCell>
            <TableCell sx={{...headCellStyle, width: '40%'}}>
              <Version version={version2} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />
              {t('concept.concepts')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.id ?
                  version1?.summary?.active_concepts?.toLocaleString() :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.id ?
                  version2?.summary?.active_concepts?.toLocaleString() :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <MappingIcon color='secondary' sx={{marginRight: '16px'}} />
              {t('mapping.mappings')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.id ?
                  version1?.summary?.active_mappings?.toLocaleString() :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.id ?
                  version2?.summary?.active_mappings?.toLocaleString() :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <LanguageIcon fontSize='small' color='secondary' sx={{marginRight: '16px'}} />
              {t('common.languages')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.id ?
                  getLocales(version1) :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.id ?
                  getLocales(version2) :
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />
              {t('concept.concept_classes')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.concepts.concept_class.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.concepts.concept_class.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />
              {t('concept.datatypes')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.concepts.datatype.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.concepts.datatype.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <ConceptIcon fontSize='small' selected color='secondary' sx={{marginRight: '16px'}} />
              {t('concept.name_types')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.concepts.name_type.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.concepts.name_type.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <ConceptIcon fontSize='small' sx={{marginRight: '16px', color: 'secondary.60'}} />
              {t('concept.retired_concepts')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.concepts.retired.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.concepts.retired.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <MappingIcon color='secondary' sx={{marginRight: '16px'}} />
              {t('mapping.map_types')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.mappings.map_type.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.mappings.map_type.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <MappingIcon color='secondary' sx={{marginRight: '16px'}} />
              {t('mapping.to_concept_sources')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.mappings.to_concept_source.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.mappings.to_concept_source.length.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{...cellStyle, display: 'flex', alignItems: 'center'}}>
              <MappingIcon sx={{marginRight: '16px', color: 'secondary.60'}} />
              {t('mapping.retired_mappings')}
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version1?.summary?.id ?
                  version1.summary.mappings.retired.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
            <TableCell sx={cellStyle}>
              {
                version2?.summary?.id ?
                  version2.summary.mappings.retired.toLocaleString():
                  <Skeleton variant="text" sx={{ fontSize: '16px', width: '40px' }} />
              }
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default VersionStats;
