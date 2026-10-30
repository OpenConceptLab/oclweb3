import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import times from 'lodash/times';
import APIService from '../../services/APIService';
import { toMapperURL, pluralize } from '../../common/utils';
import { mergeProjects, filterProjects, fetchAllPages } from '../../common/mapProjects';

const COLUMN_COUNT = 5
const PAGE_SIZE = 100
const MAX_PAGES = 20

// The API pages its lists, and the tab filters on the client, so it loads every page
const loadAll = getService => fetchAllPages(page => getService().get(null, null, {limit: PAGE_SIZE, page}), MAX_PAGES)

const MapProjects = ({ ownerType, owner, height }) => {
  const { t } = useTranslation()
  const history = useHistory()
  const location = useLocation()
  const [projects, setProjects] = React.useState(null)
  const [failed, setFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)
  const query = new URLSearchParams(location.search).get('q') || ''
  const shown = filterProjects(projects, query)

  React.useEffect(() => {
    let active = true
    setProjects(null)
    setFailed(false)
    const requests = [loadAll(() => APIService[ownerType](owner).appendToUrl('map-projects/'))]
    if(ownerType === 'users')
      requests.push(loadAll(() => APIService.users(owner).appendToUrl('orgs/map-projects/')))
    Promise.all(requests).then(lists => {
      if(active)
        setProjects(mergeProjects(...lists))
    }, () => {
      if(active)
        setFailed(true)
    })
    return () => { active = false }
  }, [ownerType, owner, attempt])

  const onClearQuery = () => history.push(location.pathname)

  return (
    <div style={{height: height, display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', minHeight: '56px', padding: '0 16px'}}>
        {
          failed ? null : shown === null ?
            <Skeleton variant='text' sx={{fontSize: '1rem', width: '15%'}} /> :
            <Typography variant='h7' component='div' sx={{color: 'rgba(0, 0, 0, 0.7)'}}>
              {pluralize(shown.length, t('map_project.mapping_project').toLowerCase(), t('map_project.mapping_projects').toLowerCase())}
            </Typography>
        }
        {
          query &&
            <Chip size='small' icon={<SearchIcon />} label={query} onDelete={onClearQuery} title={t('common.clear')} />
        }
      </div>
      <TableContainer sx={{flex: 1, minHeight: 0, overflow: 'auto'}}>
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
              failed &&
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} align='center' sx={{borderBottom: 'none', padding: '48px 16px'}}>
                    <Typography sx={{color: 'surface.dark'}}>
                      {t('map_project.could_not_load_projects')} <Link component='button' onClick={() => setAttempt(count => count + 1)} sx={{verticalAlign: 'baseline'}}>{t('map_project.try_again')}</Link>
                    </Typography>
                  </TableCell>
                </TableRow>
            }
            {
              !failed && shown === null &&
                times(5, i => (
                  <TableRow key={i}>
                    {times(COLUMN_COUNT, ci => <TableCell key={ci}><Skeleton height={48} sx={{WebkitTransform: 'none', transform: 'none'}} /></TableCell>)}
                  </TableRow>
                ))
            }
            {
              shown?.length === 0 &&
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} align='center' sx={{borderBottom: 'none', padding: '48px 16px'}}>
                    <Typography sx={{color: 'surface.dark'}}>
                      {
                        query ?
                          <React.Fragment>{t('search.no_results')}<b>{query}</b>.</React.Fragment> :
                          t('map_project.no_projects_found')
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
            }
            {
              shown?.map(project => (
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
    </div>
  )
}

export default MapProjects
