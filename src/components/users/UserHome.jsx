import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom'
import { getCurrentUser } from '../../common/utils'
import { S_90 } from '../../common/constants'
import UserProfile from './UserProfile'
import APIService from '../../services/APIService'
import CommonTabs from '../common/CommonTabs';
import UserOverview from './UserOverview';
import Search from '../search/Search';


const UserHome = () => {
  const { t } = useTranslation()
  const params = useParams()
  const history = useHistory()
  const [tab, setTab] = React.useState(findTab || 'overview')
  const [user, setUser] = React.useState({})
  const [bookmarks, setBookmarks] = React.useState(false)
  const height = 'calc(100vh - 100px)'
  const TABS = [
    {key: 'overview', label: t('common.overview')},
    {key: 'repos', label: t('repo.repos')},
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab) ? params.tab : 'overview'
  const currentUser = getCurrentUser()
  const isCurrentUser = Boolean(currentUser?.username && currentUser?.username == params.user)

  const fetchUser = () => {
    setBookmarks(false)
    if(isCurrentUser) {
      setUser(currentUser)
      fetchBookmarks()
    } else {
      APIService.users(params.user).get(null, null, {includeSubscribedOrgs: true}).then(response => {
        if(response.status === 200) {
          setUser(response.data)
          fetchBookmarks()
        }
        else if(response.status)
          window.location.hash = '#/' + response.status
        else if(response.detail === 'Not found.')
          window.location.hash = '#/404/'
      })
    }
  }

  const fetchBookmarks = () => {
    if(params?.user && isCurrentUser) {
      APIService.users(params?.user).appendToUrl('pins/').get().then(response => {
        setBookmarks(response?.data?.length ? response.data : [])
      })
    }
  }

  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      let URL = user.url
      if(newTab !== 'overview') {
        URL += '/' + newTab
      }
      history.push(URL.replace('//', '/'))
    }
  }



  React.useEffect(() => { fetchUser() }, [params.user])
  React.useEffect(() => { setTab(params.tab || 'overview') }, [params.tab])

  const baseHeightToDeduct = bookmarks ? 325 : 175
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-3' style={{height: height, padding: '24px 24px 24px 8px', maxWidth: '20%', overflow: 'auto'}}>
        <UserProfile user={user} isCurrentUser={isCurrentUser} />
      </div>
      <div className='col-xs-10 padding-0' style={{backgroundColor: '#FFF', borderRadius: '10px', height: height, maxWidth: '80%', border: `1px solid ${S_90}`, borderTop: 'none'}}>
        <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} sx={{borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}} />
        {
          user?.url && tab === 'repos' &&
            <Search
              resource='repos'
              url={user?.url + 'orgs/repos/'}
              nested
              noTabs
              filtersHeight={`calc(100vh - ${baseHeightToDeduct}px)`}
              resultContainerStyle={{height: `calc(100vh - ${baseHeightToDeduct}px - 100px)`, overflow: 'auto'}}
              containerStyle={{padding: 0}}
              defaultFiltersOpen={false}
              resultSize='medium'
              excludedColumns={['owner']}
            />
        }
        {
          tab === 'overview' && user?.url &&
            <UserOverview user={user} bookmarks={bookmarks} height={height} />
        }
      </div>
    </div>
  )
}

export default UserHome
