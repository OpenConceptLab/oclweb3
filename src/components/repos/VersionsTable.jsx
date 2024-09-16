import React from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import without from 'lodash/without'
import ConceptIcon from '../common/ConceptIcon'
import MappingIcon from '../mappings/MappingIcon';
import { formatDate } from '../../common/utils'
import { SURFACE_COLORS, BLACK } from '../../common/colors'
import Button from '../common/Button';

const VersionsTable = ({ selected, versions, onChange, bgColor }) => {
  const { t } = useTranslation()
  const [checked, setChecked] = React.useState([])
  const selectedColor = SURFACE_COLORS.s90
  const getBodyCellStyle = isSelected =>  {
    let backgroundColor = isSelected ? selectedColor : bgColor
    return {
      fontSize: '14px',
      background: backgroundColor,
      color: isSelected ? BLACK : 'secondary.main',
      borderBottom: 'none',
      fontWeight: isSelected ? 'bold': 'normal'
    }
  }
  const onCheck = version => {
    setChecked(checked.includes(version) ? without(checked, version.version_url) : [...checked, version.version_url])
  }
  return (
    <React.Fragment>
      <TableContainer sx={{height: '220px'}}>
        <Table
          stickyHeader
          sx={{ maxWidth: 650 }}
          size='small'
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{background: bgColor}} />
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
                Visibility
              </TableCell>
              <TableCell sx={{fontSize: '12px', fontWeight: 'bold', background: bgColor}}>
                Release status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              versions?.map(version => {
                const isSelected = version.version_url == (selected.version_url || selected.url)
                const bodyCellStyle = getBodyCellStyle(isSelected)
                return (
                  <TableRow key={version.id} id={version.id} sx={{cursor: 'pointer'}}>
                    <TableCell padding="checkbox" sx={{...bodyCellStyle, borderTopLeftRadius: '50px', borderBottomLeftRadius: '50px'}} onClick={() => onCheck(version)}>
                      <Checkbox color="primary" size='small' checked={checked.includes(version.version_url)} onChange={() => onCheck(version)} />
                    </TableCell>
                    <TableCell sx={{...bodyCellStyle}} onClick={() => onChange(version)}>
                      {version.id}
                    </TableCell>
                    <TableCell sx={{...bodyCellStyle}} onClick={() => onChange(version)}>
                      {moment(version.created_on).fromNow()}
                    </TableCell>
                    <TableCell sx={{...bodyCellStyle}} onClick={() => onChange(version)}>
                      <span style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{marginRight: '8px', display: 'flex', alignItems: 'center'}}>
                          <ConceptIcon selected color='secondary' sx={{width: '9px', height: '9px', marginRight: '4px'}} /> {version.summary.active_concepts?.toLocaleString()}
                        </span>
                        <span style={{display: 'flex', alignItems: 'center'}}>
                          <MappingIcon width="15px" height='13px' fill='secondary.main' color='secondary' sx={{width: '15px', height: '13px', marginRight: '4px'}} /> {version.summary.active_mappings?.toLocaleString()}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell sx={{...bodyCellStyle}} onClick={() => onChange(version)}>
                      {version.public_access}
                    </TableCell>
                    <TableCell sx={{...bodyCellStyle, borderTopRightRadius: '50px', borderBottomRightRadius: '50px'}} onClick={() => onChange(version)}>
                      {version.released ? formatDate(version.updated_on) : ''}
                    </TableCell>
                  </TableRow>
                )
              })
            }
          </TableBody>
        </Table>
      </TableContainer>
      {
        checked?.length == 2 &&
          <Button sx={{marginTop: '16px', display: 'flex'}} onClick={() => {}} label={t('repo.compare_versions')} color='primary' variant='outlined' />
      }
    </React.Fragment>
  )
}

export default VersionsTable
