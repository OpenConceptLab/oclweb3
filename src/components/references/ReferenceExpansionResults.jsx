import React from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';


import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import RepoChip from '../repos/RepoChip'
import ConceptIcon from '../concepts/ConceptIcon'
import Associations from '../concepts/Associations'

import { map, times, without } from 'lodash'

import { BLACK } from '../../common/colors'

const borderColor = 'rgba(0, 0, 0, 0.12)'

const MappingsTable = ({mappings, loading, t}) => {
  return (
    <React.Fragment>
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
        {t('mapping.mappings')}
      </Typography>
      <Associations mappings={mappings} reverseMappings={[]} ownerMappings={[]} reverseOwnerMappings={[]} nested loadingOwnerMappings={loading} />
    </React.Fragment>
  )
}

const ConceptsAndMappingsTable = ({reference, concepts, loading, t}) => {
  const [open, setOpen] = React.useState([])
  const toggleRow = conceptURL => {
    setOpen(open.includes(conceptURL) ? without(open, conceptURL) : [...open, conceptURL])
  }

  return (
    <React.Fragment>
      <Typography component='span' sx={{borderBottom: '1px solid', borderColor: borderColor, padding: '12px 16px', fontSize: '16px', color: 'surface.contrastText', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold'}}>
          {t('reference.concepts_and_mappings')}
        </Typography>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell><b>{t('common.id')}</b></TableCell>
              <TableCell><b>{t('concept.display_name')}</b></TableCell>
              <TableCell sx={{width: '10%'}}><b>{t('mapping.mappings')}</b></TableCell>
              <TableCell><b>{t('repo.repo')}</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              loading ?
                <>
              {
                  times((reference.concepts || 1), i => (
                    <TableRow key={i}>
                      <TableCell colSpan={4}>
                        <Skeleton width='100%' />
                      </TableCell>
                    </TableRow>
                  ))
              }
                </> :
              <>
                {
                  map(concepts, (concept, index) => {
                    let key = concept.version_url || concept.url
                    const hasMappings = concept.mappings?.length > 0
                    const isOpen = open.includes(key)
                    const isLastConcept = index === (concepts?.length || 0) - 1
                    return (
                      <React.Fragment key={key}>
                      <TableRow
                        sx={isLastConcept && !isOpen ? {
                          '& > .MuiTableCell-root': {
                            borderBottom: 0,
                            '&:first-of-type': {
                              borderBottomLeftRadius: '10px'
                            },
                            '&:last-child': {
                              borderBottomRightRadius: '10px'
                            }
                          }
                        } : undefined}
                      >
                        <TableCell>
                          <span style={{display: 'flex', alignItems: 'center'}}>
                      <ConceptIcon selected sx={{marginRight: '8px', fontSize: '1rem'}} />
                      {concept.id}
                      </span>
                        </TableCell>
                        <TableCell>
                          {concept.display_name}
                        </TableCell>
                        <TableCell align='center'>
                          {
                            hasMappings ?
                              <Button onClick={() => toggleRow(key)} sx={{color: isOpen ? 'primary' : 'rgba(0, 0, 0, 0.87)'}} startIcon={isOpen ? <RemoveIcon /> : <AddIcon />} variant='text'>{concept.mappings.length}</Button> :
                            '0'
                          }
                        </TableCell>
                        <TableCell>
                          <RepoChip filled primary size='small' hideType repo={{id: concept.source, url: `${concept.owner_url}sources/${concept.source}/`, owner: concept.owner, owner_type: concept.owner_type, owner_url: concept.owner_url}}/>
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={isLastConcept ? {
                          '& > .MuiTableCell-root': {
                            borderBottom: 0,
                            borderBottomLeftRadius: isOpen ? '10px' : 0,
                            borderBottomRightRadius: isOpen ? '10px' : 0
                          }
                        } : undefined}
                      >
                        <TableCell style={{ padding: '0 8px' }} colSpan={4}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: '8px 0', display: 'inline-block' }}>
                      <Associations concept={concept} mappings={concept.mappings} reverseMappings={[]} ownerMappings={[]} reverseOwnerMappings={[]} nested />
                      </Box>
                      </Collapse>
                      </TableCell>
                      </TableRow>
                      </React.Fragment>
                    )
                  })
                }
              </>
            }
          </TableBody>
        </Table>
    </React.Fragment>
  )
}

const ReferenceExpansionResults = ({ reference, concepts, mappings, loading }) => {
  const { t } = useTranslation()

  const statSx = {
    '.MuiListItemText-primary': {
      color: 'rgba(0, 0, 0, 0.6)',
      fontSize: '1rem'
    },
    '.MuiListItemText-secondary': {
      color: BLACK,
      fontSize: '1.5rem'
    }
  }

  const isMappingsOnly = Boolean(!reference.concepts && reference.mappings)

  return (
    <div className='col-xs-12' style={{padding: '16px 0'}}>
      <Card variant='outlined' sx={{borderRadius: '10px'}}>
        <CardContent sx={{display: 'flex', padding: '4px 16px !important'}}>
          <ListItemText sx={statSx} primary={t('concept.concepts')} secondary={reference?.last_resolved_at ? (reference.concepts || 0)?.toLocaleString() : '-'}/>
          <ListItemText sx={statSx} primary={t('mapping.mappings')} secondary={reference?.last_resolved_at ? (reference.mappings || 0)?.toLocaleString() : '-'}/>
        </CardContent>
      </Card>
      <Paper className='col-xs-12 padding-0' sx={{boxShadow: 'none', border: '1px solid', borderColor: borderColor, borderRadius: '10px', marginTop: '16px'}}>
        {
          isMappingsOnly ?
            <MappingsTable reference={reference} mappings={mappings} loading={loading} t={t} /> :
          <ConceptsAndMappingsTable reference={reference} concepts={concepts} loading={loading} t={t} />
        }
      </Paper>
    </div>
  )
}

export default ReferenceExpansionResults;
