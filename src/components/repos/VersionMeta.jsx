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
import ExpansionLabel from './ExpansionLabel'
import RepoChip from './RepoChip'
import { formatDate } from '../../common/utils'

const formatParameterValue = value => {
  if(value === '' || value === undefined || value === null)
    return ''
  if(typeof value === 'boolean')
    return value ? 'true' : 'false'
  return String(value)
}

const getRepoVersions = (expansion, fields) => fields.flatMap(field => expansion?.[field] || [])

const sortVersions = versions => [...(versions || [])].sort((a, b) => {
  const idComparison = String(a?.id || '').localeCompare(String(b?.id || ''))
  if(idComparison !== 0)
    return idComparison
  return String(a?.version || '').localeCompare(String(b?.version || ''))
})

const renderVersionChips = versions => {
  const sorted = sortVersions(versions)
  return sorted.map(version => (
    <div key={version.url} style={{marginBottom: '4px'}}>
      <RepoChip repo={version} size='small' hideType />
    </div>
  ))
}

const getUnresolvedRepoVersionURL = item => typeof item === 'string' ? item : (item?.url || JSON.stringify(item))

const renderUnresolvedRepoVersions = items => {
  const sorted = [...(items || [])].map(getUnresolvedRepoVersionURL).sort((a, b) => a.localeCompare(b))
  return sorted.map(url => (
    <div key={url} style={{fontSize: '12px', wordBreak: 'break-word'}}>{url}</div>
  ))
}

const MetaValueRow = ({label, value1, value2, cellStyle, lastCellStyle}) => (
  <TableRow>
    <TableCell sx={{...cellStyle, verticalAlign: 'top'}}>
      <span style={{display: 'flex', alignItems: 'center'}}>{label}</span>
    </TableCell>
    <TableCell sx={{...cellStyle, verticalAlign: 'top'}}>{value1}</TableCell>
    <TableCell sx={{...lastCellStyle, verticalAlign: 'top'}}>{value2}</TableCell>
  </TableRow>
)

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
      <TableCell sx={{...cellStyle, verticalAlign: 'top'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {icon}
          {label}
        </span>
      </TableCell>
      <TableCell sx={{...cellStyle, verticalAlign: 'top'}}>
        {
          version1?.id ?
            getValue(version1):
            <Skeleton variant="circular" width={20} height={20} />
        }
      </TableCell>
      <TableCell sx={{...lastCellStyle, verticalAlign: 'top'}}>
        {
          version2?.id ?
            getValue(version2) :
            <Skeleton variant="circular" width={20} height={20} />
        }
      </TableCell>
    </TableRow>
  )
}

const COLUMN_WIDTHS = ['20%', '40%', '40%']

const VersionMeta = ({version1, version2, isCollection, expansion1, expansion2}) => {
  const { t } = useTranslation()
  const lastCellStyle = {borderBottom: '1px solid', borderColor: 'surface.nv80'}
  const cellStyle = {borderRight: '1px solid', ...lastCellStyle}
  const lastHeadCellStyle = {...lastCellStyle, backgroundColor: 'surface.main'}
  const headCellStyle = {...cellStyle, backgroundColor: 'surface.main'}
  const tableSx = {tableLayout: 'fixed'}

  const parameterKeys = React.useMemo(() => {
    if(!isCollection)
      return []
    return Array.from(new Set([
      ...Object.keys(expansion1?.parameters || {}),
      ...Object.keys(expansion2?.parameters || {})
    ]))
  }, [isCollection, expansion1, expansion2])

  return (
    <TableContainer sx={{ maxHeight: 'calc(var(--app-height) - 270px)' }}>
      <Table size='small' stickyHeader aria-label="version metadata table" sx={tableSx}>
        <TableHead>
          <TableRow>
            <TableCell sx={{...headCellStyle, width: COLUMN_WIDTHS[0]}} />
            <TableCell sx={{...headCellStyle, width: COLUMN_WIDTHS[1]}}>
              <RepoVersionLabel version={version1} />
            </TableCell>
            <TableCell sx={{...lastHeadCellStyle, width: COLUMN_WIDTHS[2]}}>
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
            label={t('common.website')}
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
      {
        isCollection &&
          <Table size='small' stickyHeader aria-label="expansion metadata table" sx={tableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={{...headCellStyle, width: COLUMN_WIDTHS[0]}} />
                <TableCell sx={{...headCellStyle, width: COLUMN_WIDTHS[1]}}>
                  {expansion1 && <ExpansionLabel expansion={expansion1} />}
                </TableCell>
                <TableCell sx={{...lastHeadCellStyle, width: COLUMN_WIDTHS[2]}}>
                  {expansion2 && <ExpansionLabel expansion={expansion2} />}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <MetaValueRow
                label={t('repo.explicit_repo_versions')}
                cellStyle={cellStyle}
                lastCellStyle={lastCellStyle}
                value1={expansion1 ? renderVersionChips(getRepoVersions(expansion1, ['explicit_source_versions', 'explicit_collection_versions'])) : null}
                value2={expansion2 ? renderVersionChips(getRepoVersions(expansion2, ['explicit_source_versions', 'explicit_collection_versions'])) : null}
              />
              <MetaValueRow
                label={t('repo.evaluated_repo_versions')}
                cellStyle={cellStyle}
                lastCellStyle={lastCellStyle}
                value1={expansion1 ? renderVersionChips(getRepoVersions(expansion1, ['evaluated_source_versions', 'evaluated_collection_versions'])) : null}
                value2={expansion2 ? renderVersionChips(getRepoVersions(expansion2, ['evaluated_source_versions', 'evaluated_collection_versions'])) : null}
              />
              <MetaValueRow
                label={t('repo.unresolved_repo_versions')}
                cellStyle={cellStyle}
                lastCellStyle={lastCellStyle}
                value1={expansion1 ? renderUnresolvedRepoVersions(expansion1.unresolved_repo_versions) : null}
                value2={expansion2 ? renderUnresolvedRepoVersions(expansion2.unresolved_repo_versions) : null}
              />
              {
                parameterKeys.map(key => (
                  <MetaValueRow
                    key={`parameter-${key}`}
                    label={`parameter.${key}`}
                    cellStyle={cellStyle}
                    lastCellStyle={lastCellStyle}
                    value1={expansion1 ? formatParameterValue(get(expansion1, `parameters.${key}`)) : null}
                    value2={expansion2 ? formatParameterValue(get(expansion2, `parameters.${key}`)) : null}
                  />
                ))
              }
              <StatRow
                label={t('common.created_on')}
                version1={expansion1}
                version2={expansion2}
                statFunc={expansion => formatDate(expansion.created_on)}
              />
              <StatRow
                label={t('common.updated_on')}
                version1={expansion1}
                version2={expansion2}
                statFunc={expansion => formatDate(expansion.updated_on)}
              />
              <StatRow
                label={t('common.created_by')}
                version1={expansion1}
                version2={expansion2}
                statKey='created_by'
              />
            </TableBody>
          </Table>
      }
    </TableContainer>
  )
}
export default VersionMeta;
