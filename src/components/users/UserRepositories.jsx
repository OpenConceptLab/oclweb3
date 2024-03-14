import React from 'react';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import map from 'lodash/map';
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import { getCurrentUser, canAccessUser } from '../../common/utils';
import Search from '../search/Search';
import APIService from '../../services/APIService'
import AddButton from '../common/AddButton';
import Bookmark from '../common/Bookmark';
import Error403 from '../errors/Error403';

const UserRepositories = ({ user, profile }) => {
  const params = useParams()
  const { t } = useTranslation()
  const sessionUser = getCurrentUser()
  const [currentUser, setCurrentUser] = React.useState(user || {})
  const [bookmarks, setBookmarks] = React.useState(false)
  const [accessDenied, setAccessDenied] = React.useState(false)

  React.useEffect(() => {
    !user && fetchUser()
  }, [params.user])

  const fetchUser = () => {
    if(params.user === sessionUser?.username) {
      setCurrentUser(sessionUser)
      fetchBookmarks()
      setAccessDenied(false)
    } else if(params.user) {
      if(canAccessUser(params.user)) {
        setAccessDenied(false)
        APIService.users(params.user).get(null, null, {includeSubscribedOrgs: true}).then(response => {
          if(response.status === 200) {
            setCurrentUser(response.data)
            fetchBookmarks()
          }
          else if(response.status)
            window.location.hash = '#/' + response.status
          else if(response.detail === 'Not found.')
            window.location.hash = '#/404/'
        })

      } else
        setAccessDenied(true)
    }
  }

  const fetchBookmarks = () => {
    if(params?.user && sessionUser?.username === params?.user) {
      APIService.users(params?.user).appendToUrl('pins/').get().then(response => {
        setBookmarks(response?.data?.length ? response.data : [])
      })
    }
  }

  const baseHeightToDeduct = bookmarks ? 325 : 175

  return (
    <div className='col-xs-12 padding-0'>
      {
        !user &&
          <React.Fragment>
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
            {
              Boolean(bookmarks && bookmarks?.length) &&
                <div className='col-xs-12 padding-0' style={{marginBottom: '16px'}}>
                  <Typography component='h3' sx={{margin: '12px 0'}}>{t('bookmarks.pinned')}</Typography>
                  {
                    map(bookmarks, (bookmark, i) => (
                      <Bookmark key={bookmark.id} bookmark={bookmark} isLast={i === (bookmarks.length - 1)} />
                    ))
                  }
                </div>
            }
          </React.Fragment>
      }
      {
        accessDenied ?
          (user ? null : <Error403 />) :
          <Search
            resource='repos'
            url={currentUser?.url + (profile ? '' : 'orgs/') + 'repos/'}
            nested
            noTabs
            filtersHeight={`calc(100vh - ${baseHeightToDeduct}px)`}
            resultContainerStyle={{height: `calc(100vh - ${baseHeightToDeduct}px - 100px)`, overflow: 'auto'}}
            containerStyle={{padding: 0}}
            defaultFiltersOpen={false}
            resultSize='medium'
            excludedColumns={profile ? ['owner']: []}
          />
      }
    </div>
  )
}

export default UserRepositories;
