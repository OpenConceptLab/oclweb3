import React from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentUser, canAccessUser } from '../../common/utils'
import UserSettingOptions from './UserSettingOptions';
import URLRegistry from '../url-registry/URLRegistry'
import APIService from '../../services/APIService'
import Error403 from '../errors/Error403';
import Error40X from '../errors/Error40X';

const UserSettings = () => {
  const [user, setUser] = React.useState({})
  const [status, setStatus] = React.useState(false)
  const params = useParams()
  const height = 'calc(100vh - 100px)'
  const canAccess = getCurrentUser()?.username && canAccessUser(params.user)

  const fetchUser = () => {
    const currentUser = getCurrentUser()
    if(params.user === currentUser?.username) {
      setStatus(200)
      setUser(currentUser)
    } else {
      APIService.users(params.user).get(null, null, null, true).then(response => {
        const newStatus = response?.status || response?.response?.status
        const data = response?.data || response?.response?.data || {}
        setStatus(newStatus)
        if(newStatus === 200)
          setUser(data)
      })
    }
  }

  React.useEffect(() => {
    fetchUser()
  }, [params.user])

  return (
    <div className='col-xs-12 padding-0'>
      {
        !canAccess ?
          <Error403 /> :
        status && status !== 200 ?
          <Error40X status={status} /> :
        <React.Fragment>
          <div className='col-xs-3' style={{height: height, padding: '24px 24px 24px 8px', maxWidth: '20%'}}>
            <UserSettingOptions user={user} />
          </div>
          <div className='col-xs-10 padding-0' style={{height: height, maxWidth: '80%'}}>
            {
              user?.url &&
                <URLRegistry />
            }
          </div>
        </React.Fragment>
      }
    </div>
  )
}

export default UserSettings;
