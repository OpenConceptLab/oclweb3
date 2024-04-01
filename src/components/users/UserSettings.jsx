import React from 'react'
import { useParams } from 'react-router-dom'
import { getCurrentUser, canAccessUser } from '../../common/utils'
import UserSettingOptions from './UserSettingOptions';
import URLRegistry from '../url-registry/URLRegistry'
import APIService from '../../services/APIService'
import Error403 from '../errors/Error403';

const UserSettings = () => {
  const [user, setUser] = React.useState({})
  const params = useParams()
  const height = 'calc(100vh - 100px)'
  const canAccess = getCurrentUser()?.username && canAccessUser(params.user)

  const fetchUser = () => {
    const currentUser = getCurrentUser()
    if(params.user === currentUser?.username) {
      setUser(currentUser)
    } else {
      APIService.users(params.user).get().then(response => {
        if(response.status === 200)
          setUser(response.data)
        else if(response.status)
          window.location.hash = '#/' + response.status
        else if(response.detail === 'Not found.')
          window.location.hash = '#/404/'
      })
    }
  }

  React.useEffect(() => {
    fetchUser()
  }, [params.user])

  return (
    <div className='col-xs-12 padding-0'>
      {
        canAccess ?
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
          </React.Fragment> :
        <Error403 />
      }
    </div>
  )
}

export default UserSettings;
