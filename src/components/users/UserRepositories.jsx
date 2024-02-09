import React from 'react';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { getCurrentUser } from '../../common/utils';
import Search from '../search/Search';
import APIService from '../../services/APIService'
import AddButton from '../common/AddButton';

const UserRepositories = ({ user }) => {
  const params = useParams()
  const { t } = useTranslation()
  const [currentUser, setCurrentUser] = React.useState(user || {})

  React.useEffect(() => {
    !user && fetchUser()
  }, [params.user])

  const fetchUser = () => {
    const currentUser = getCurrentUser()
    if(params.user === currentUser?.username) {
      setCurrentUser(currentUser)
    } else {
      APIService.users(params.user).get(null, null, {includeSubscribedOrgs: true}).then(response => {
        if(response.status === 200)
          setCurrentUser(response.data)
        else if(response.status)
          window.location.hash = '#/' + response.status
        else if(response.detail === 'Not found.')
          window.location.hash = '#/404/'
      })
    }
  }

  return (
    <div className='col-xs-12 padding-0'>
      {
        !user &&
          <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
            <div className='col-xs-6 padding-0'>
              <Typography component='h1' sx={{color: '#000', fontSize: '2em', margin: '16px 0', fontWeight: 'bold'}}>
                {t('user.my_repositories')}
              </Typography>
            </div>
            <div className='col-xs-6 padding-0' style={{display: 'flex', justifyContent: 'end'}}>
              <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
                <DownloadIcon fontSize='inherit' />
              </IconButton>
              <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
                <ShareIcon fontSize='inherit' />
              </IconButton>
              <AddButton label={t('dashboard.create_repository')} color='primary' onClick={() => {}} />
            </div>
          </div>
      }
      <Search
        resource='repos'
        url={currentUser?.url + 'repos/'}
        nested
        noTabs
        filtersHeight='calc(100vh - 100px)'
        resultContainerStyle={{height: 'calc(100vh - 200px)', overflow: 'auto'}}
        containerStyle={{padding: 0}}
        defaultFiltersOpen={false}
        resultSize='medium'
      />
    </div>
  )
}

export default UserRepositories;
