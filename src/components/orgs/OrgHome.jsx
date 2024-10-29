import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import APIService from '../../services/APIService'
import OrgHeader from './OrgHeader'
import CommonTabs from '../common/CommonTabs';
import Search from '../search/Search';
import OrgOverview from './OrgOverview';
import OrgSummary from './OrgSummary';

const OrgHome = () => {
  const { t } = useTranslation()
  const params = useParams()
  const history = useHistory()
  const [org, setOrg] = React.useState({})
  const [members, setMembers] = React.useState([])
  const [bookmarks, setBookmarks] = React.useState(false)
  const [tab, setTab] = React.useState(findTab)
  const TABS = [
    {key: 'overview', label: t('common.overview')},
    {key: 'repos', label: t('repo.repos')},
  ]
  const TAB_KEYS = TABS.map(tab => tab.key)
  const findTab = () => TAB_KEYS.includes(params?.tab) ? params.tab : 'overview'
  const fetchOrg = () => {
    APIService.orgs(params.org).get().then(response => {
      if(response?.data?.id) {
        setOrg(response.data)
        fetchMembers()
        fetchBookmarks()
      } else if(response.status)
        window.location.hash = '#/' + response.status
      else if(response.detail === 'Not found.')
        window.location.hash = '#/404/'
    })
  }
  const fetchMembers = () => {
    APIService.orgs(params.org).appendToUrl('members/?verbose=true').get().then(response => {
      if(response?.data?.length)
        setMembers(response.data)
    })
  }
  const fetchBookmarks = () => {
    if(params?.org) {
      APIService.orgs(params?.org).appendToUrl('pins/').get().then(response => {
        setBookmarks(response?.data?.length ? response.data : [])
      })
    }
  }
  const onTabChange = (event, newTab) => {
    if(newTab) {
      setTab(newTab)
      let URL = org.url
      if(newTab !== 'overview') {
        URL += '/' + newTab
      }
      history.push(URL.replace('//', '/'))
    }
  }

  React.useEffect(() => { fetchOrg() }, [params.org])
  React.useEffect(() => { setTab(params.tab || 'overview') }, [params.tab])

  const height = 'calc(100vh - 300px)'

  return (
    <div className='col-xs-12 padding-0' style={{borderRadius: '8px'}}>
      <Paper component="div" className='col-xs-12 split padding-0' sx={{backgroundColor: 'info.contrastText', borderRadius: '10px', boxShadow: 'none', p: 0, border: 'solid 0.3px', borderColor: 'surface.n90'}}>
        {
          org?.id &&
            <React.Fragment>
              <OrgHeader org={org} />
              <div className='padding-0 col-xs-12' style={{width: 'calc(100% - 272px)'}}>
                <CommonTabs TABS={TABS} value={tab} onChange={onTabChange} />
                {
                  tab === 'repos' &&
                    <Search
                      resource={tab}
                      url={org.url + tab + '/'}
                      defaultFiltersOpen={false}
                      nested
                      noTabs
                      filtersHeight='calc(100vh - 275px)'
                      resultContainerStyle={{height: 'calc(100vh - 375px)', overflow: 'auto'}}
                      containerStyle={{padding: 0}}
                    />
                }
                {
                  tab === 'overview' && org?.id &&
                    <OrgOverview org={org} bookmarks={bookmarks} height={height} />
                }
              </div>
              <Paper component='div' className='col-xs-12' sx={{height: 'calc(100vh - 225px)', width: '272px !important', borderLeft: '0.5px solid', borderColor: 'surface.n90', borderRadius: 0, boxShadow: 'none', padding: '16px', overflow: 'auto', backgroundColor: 'default.main'}}>
                <OrgSummary org={org} members={members} />
              </Paper>
            </React.Fragment>
        }
      </Paper>

    </div>
  )
}

export default OrgHome;
