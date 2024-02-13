import React from 'react';
import { useParams } from 'react-router-dom'
import { getCurrentUser } from '../../common/utils'
import UserProfile from './UserProfile'
import UserRepositories from './UserRepositories';
import APIService from '../../services/APIService'


const UserHome = () => {
  const [user, setUser] = React.useState({})
  const params = useParams()

  const height = 'calc(100vh - 100px)'
  React.useEffect(() => {
    fetchUser()
  }, [params.user])

  const fetchUser = () => {
    const currentUser = getCurrentUser()
    if(params.user === currentUser?.username) {
      setUser(currentUser)
    } else {
      APIService.users(params.user).get(null, null, {includeSubscribedOrgs: true}).then(response => {
        if(response.status === 200)
          setUser(response.data)
        else if(response.status)
          window.location.hash = '#/' + response.status
        else if(response.detail === 'Not found.')
          window.location.hash = '#/404/'
      })
    }
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-3' style={{height: height, padding: '24px', maxWidth: '20%'}}>
        <UserProfile user={user} />
      </div>
      <div className='col-xs-10 padding-0' style={{backgroundColor: '#FFF', borderRadius: '10px', height: height, maxWidth: '80%'}}>
        {
          user?.url &&
            <UserRepositories user={user} profile />
        }
      </div>
    </div>
  )
}

export default UserHome