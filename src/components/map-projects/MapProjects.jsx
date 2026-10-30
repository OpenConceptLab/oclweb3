import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import times from 'lodash/times';
import APIService from '../../services/APIService';
import { toMapperURL } from '../../common/utils';

const COLUMN_COUNT = 5

const MapProjects = ({ ownerType, owner, height }) => {
  const { t } = useTranslation()
  const [projects, setProjects] = React.useState(null)

  React.useEffect(() => {
    let active = true
    setProjects(null)
    APIService[ownerType](owner).appendToUrl('map-projects/').get().then(response => {
      if(active)
        setProjects(Array.isArray(response?.data) ? response.data : [])
    })
    return () => { active = false }
  }, [ownerType, owner])

  return (
    <TableContainer sx={{height: height, overflow: 'auto'}}>
      <Table stickyHeader size='small' sx={{minWidth: 650}}>
        <TableHead>
          <TableRow>
            <TableCell>{t('common.id')}</TableCell>
            <TableCell>{t('map_project.project_name')}</TableCell>
            <TableCell>{t('common.owner')}</TableCell>
            <TableCell>{t('common.created_by')}</TableCell>
            <TableCell>{t('common.updated_by')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            projects === null &&
              times(5, i => (
                <TableRow key={i}>
                  {times(COLUMN_COUNT, ci => <TableCell key={ci}><Skeleton height={48} sx={{WebkitTransform: 'none', transform: 'none'}} /></TableCell>)}
                </TableRow>
              ))
          }
          {
            projects?.length === 0 &&
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align='center' sx={{borderBottom: 'none', padding: '48px 16px'}}>
                  <Typography sx={{color: 'surface.dark'}}>{t('map_project.no_projects_found')}</Typography>
                </TableCell>
              </TableRow>
          }
          {
            projects?.map(project => (
              <TableRow key={project.url} hover>
                <TableCell>{project.id}</TableCell>
                <TableCell>
                  <Link href={toMapperURL(project.url)} underline='hover'>{project.name}</Link>
                </TableCell>
                <TableCell>{project.owner}</TableCell>
                <TableCell>
                  {project.created_by}
                  <Typography component='div' variant='caption' sx={{color: 'surface.light'}}>{moment(project.created_at).fromNow()}</Typography>
                </TableCell>
                <TableCell>
                  {project.updated_by}
                  <Typography component='div' variant='caption' sx={{color: 'surface.light'}}>{moment(project.updated_at).fromNow()}</Typography>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default MapProjects
