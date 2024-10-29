import React from 'react'
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import ReleaseIcon from '@mui/icons-material/VerifiedOutlined';
import DraftIcon from '@mui/icons-material/EditOutlined';
import isNumber from 'lodash/isNumber'
import without from 'lodash/without'
import ConceptIcon from '../concepts/ConceptIcon'
import AccessIcon from '../common/AccessIcon'
import MappingIcon from '../mappings/MappingIcon';
import { formatDate } from '../../common/utils'
import { SURFACE_COLORS, BLACK } from '../../common/colors'
import Button from '../common/Button';

const Row = ({ version, disabled, checkbox, bodyCellStyle, onCheck, checked, onVersionChange, originVersion }) => {
  const { t } = useTranslation()
  const isPublic = ['view', 'edit'].includes(version.public_access.toLowerCase())
  const tooltip = originVersion ? t('repo.compare_origin_version_disabled_tooltip') : t('repo.compare_destination_version_disabled_tooltip')
  return (
    <Tooltip title={disabled ? tooltip : undefined} placement='right'>
      <TableRow key={version.id} id={version.id} sx={{cursor: 'pointer'}} disabled={disabled}>
        {
          checkbox &&
            <TableCell padding="checkbox" sx={{...bodyCellStyle, borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px'}} onClick={() => !disabled && onCheck(version)}>
              <Checkbox color="primary" size='small' checked={!disabled && checked.includes(version.version_url)} onChange={() => onCheck(version)} disabled={disabled} />
            </TableCell>
        }
        <TableCell sx={{...bodyCellStyle, ...(checkbox ? {} : {borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px'})}} onClick={() => onVersionChange(version)}>
          {version.id}
        </TableCell>
      <TableCell sx={{...bodyCellStyle}} onClick={() => onVersionChange(version)}>
        {moment(version.created_on).fromNow()}
      </TableCell>
      <TableCell sx={{...bodyCellStyle}} onClick={() => onVersionChange(version)}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {
            isNumber(version?.summary?.active_concepts) &&
              <span style={{marginRight: '8px', display: 'flex', alignItems: 'center'}}>
                <ConceptIcon selected color='secondary' sx={{width: '9px', height: '9px', marginRight: '4px'}} />
                {version.summary.active_concepts.toLocaleString()}
              </span>
          }
          {
            isNumber(version?.summary?.active_mappings) &&
              <span style={{display: 'flex', alignItems: 'center'}}>
                <MappingIcon width="15px" height='13px' fill='secondary.main' color='secondary' sx={{width: '15px', height: '13px', marginRight: '4px'}} />
                {version.summary.active_mappings.toLocaleString()}
              </span>
          }
        </span>
      </TableCell>
        <TableCell sx={{...bodyCellStyle}} onClick={() => onVersionChange(version)}>
          <span style={{display: 'flex', alignItems: 'center'}}>
            <AccessIcon sx={{width: '17px', height: '17px', marginRight: '4px'}} public_access={version.public_access} /> {isPublic ? t('common.public') : t('common.private')}
            </span>
      </TableCell>
        <TableCell sx={{...bodyCellStyle, borderTopRightRadius: '50px', borderBottomRightRadius: '50px'}} onClick={() => onVersionChange(version)}>
          {
            version.id === 'HEAD' &&
              <span style={{display: 'flex', alignItems: 'center'}}>
                <DraftIcon  sx={{width: '17px', height: '17px', marginRight: '4px'}} />
                {t('common.draft')}
              </span>
          }
        {
          version.released && version.id !== 'HEAD' ?
            <span style={{display: 'flex', alignItems: 'center'}}>
              <ReleaseIcon  sx={{width: '17px', height: '17px', marginRight: '4px'}} />
              {formatDate(version.updated_on)}
            </span> :
          ''
        }
      </TableCell>
    </TableRow>
      </Tooltip>
  )
}

const VersionsTable = ({ selected, versions, onChange, bgColor, checkbox, disabledFrom, disabledUntil, originVersion }) => {
  const { t } = useTranslation()
  const history = useHistory()
  const [checked, setChecked] = React.useState([])
  const selectedColor = SURFACE_COLORS.s90
  const getBodyCellStyle = (isSelected, disabled) =>  {
    let backgroundColor = isSelected ? selectedColor : bgColor
    return {
      fontSize: '14px',
      background: backgroundColor,
      color: isSelected ? BLACK : 'secondary.main',
      borderBottom: 'none',
      fontWeight: isSelected ? 'bold': 'normal',
      opacity: disabled ? 0.5 : 1
    }
  }
  const onCheck = version => {
    const url = version.version_url || version.url
    setChecked(checked.includes(url) ? without(checked, url) : [...checked, url])
  }

  const isDisabled = version => {
    if(version.id === 'HEAD')
      return disabledFrom?.id === version.id || disabledUntil?.id === version.id

    let disabled = false
    if(disabledFrom)
      disabled = (version.id || version.version !== 'HEAD') && moment(version.created_on) >= moment(disabledFrom.created_on)
    if(!disabled && disabledUntil)
      disabled = moment(version.created_on) <= moment(disabledUntil.created_on)

    return disabled
  }

  return (
    <React.Fragment>
      <TableContainer sx={{height: '220px'}}>
        <Table
          stickyHeader
          sx={{ minWidth: 650 }}
          size='small'
        >
          <TableHead>
            <TableRow>
              {
                checkbox &&
                  <TableCell padding="checkbox" sx={{background: bgColor}} />
              }
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                {t('common.version')}
              </TableCell>
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                {t('common.created')}
              </TableCell>
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                {t('common.content_summary')}
              </TableCell>
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                {t('repo.visibility')}
              </TableCell>
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                {t('repo.release_status')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              versions?.map(version => {
                const isSelected = version?.version_url == (selected?.version_url || selected?.url)
                const disabled = isDisabled(version)
                const bodyCellStyle = getBodyCellStyle(isSelected, disabled)
                return (
                  <Row
                    key={version.id}
                    id={version.id}
                    version={version}
                    disabled={disabled}
                    checkbox={checkbox}
                    bodyCellStyle={bodyCellStyle}
                    onCheck={onCheck}
                    checked={checked}
                    onVersionChange={disabled ? () => {} : onChange}
                    originVersion={originVersion}
                  />
                )
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
      {
        checked?.length == 2 &&
          <Button sx={{marginTop: '16px', display: 'flex'}} onClick={() => history.push(`${selected?.url + 'compare-versions'}?version1=${checked[0]}&version2=${checked[1]}`)} label={t('repo.compare_versions')} color='primary' variant='outlined' />
      }
    </React.Fragment>
  )
}

export default VersionsTable
