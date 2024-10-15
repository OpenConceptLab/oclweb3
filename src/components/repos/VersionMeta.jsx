import React from 'react';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import get from 'lodash/get'
import RepoVersionLabel from './RepoVersionLabel'
import { formatDate } from '../../common/utils'

const StatRow = ({icon, label, version1, version2, statKey, statFunc}) => {
  const lastCellStyle = {borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const cellStyle = {borderRight: '1px solid', ...lastCellStyle}
  const getValue = version => {
    if(statFunc)
      return statFunc(version)
    return get(version, statKey)
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

const VersionMeta = ({version1, version2}) => {
  const { t } = useTranslation()
  const lastCellStyle = {borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const cellStyle = {borderRight: '1px solid', ...lastCellStyle}
  const lastHeadCellStyle = {...lastCellStyle, backgroundColor: 'surface.main'}
  const headCellStyle = {...cellStyle, backgroundColor: 'surface.main'}

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
            label={t('common.version')}
            version1={version1}
            version2={version2}
            statKey='id'
          />
          <StatRow
            label={t('common.name')}
            version1={version1}
            version2={version2}
            statKey='name'
          />
          <StatRow
            label={t('common.full_name')}
            version1={version1}
            version2={version2}
            statKey='full_name'
          />
          <StatRow
            label={t('common.description')}
            version1={version1}
            version2={version2}
            statKey='description'
          />
          <StatRow
            label={t('user.website')}
            version1={version1}
            version2={version2}
            statKey='website'
          />
          <StatRow
            label={t('repo.repo_type')}
            version1={version1}
            version2={version2}
            statKey='repo_type'
          />
          {
            version1?.source_type &&
              <StatRow
                label={t('repo.source_type')}
                version1={version1}
                version2={version2}
                statKey='source_type'
              />
          }
          {
            version1?.collection_type &&
              <StatRow
                label={t('repo.collection_type')}
                version1={version1}
                version2={version2}
                statKey='collection_type'
              />
          }
          <StatRow
            label={t('url_registry.canonical_url')}
            version1={version1}
            version2={version2}
            statKey='canonical_url'
          />
          <StatRow
            label={t('repo.release_status')}
            version1={version1}
            version2={version2}
            statFunc={version => version.released ? formatDate(version.updated_on) : null }
          />
          <StatRow
            label={t('repo.visibility')}
            version1={version1}
            version2={version2}
            statKey='public_access'
          />
          <StatRow
            label={t('common.retired')}
            version1={version1}
            version2={version2}
            statKey='retired'
          />
          <StatRow
            label={t('repo.custom_validation_schema')}
            version1={version1}
            version2={version2}
            statKey='custom_validation_schema'
          />
          <StatRow
            label={t('concept.form.external_id')}
            version1={version1}
            version2={version2}
            statKey='external_id'
          />
          <StatRow
            label={t('checksums.standard')}
            version1={version1}
            version2={version2}
            statKey='checksums.standard'
          />
          <StatRow
            label={t('checksums.smart')}
            version1={version1}
            version2={version2}
            statKey='checksums.smart'
          />
          <StatRow
            label={t('common.created_on')}
            version1={version1}
            version2={version2}
            statFunc={version => formatDate(version.created_on) }
          />
          <StatRow
            label={t('common.updated_on')}
            version1={version1}
            version2={version2}
            statFunc={version => formatDate(version.updated_on) }
          />
          <StatRow
            label={t('common.created_by')}
            version1={version1}
            version2={version2}
            statKey='created_by'
          />
          <StatRow
            label={t('common.updated_by')}
            version1={version1}
            version2={version2}
            statKey='updated_by'
          />
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default VersionMeta;
