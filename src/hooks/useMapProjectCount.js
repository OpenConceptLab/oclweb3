import React from 'react';
import APIService from '../services/APIService';
import { projectCount } from '../common/mapProjects';

const useMapProjectCount = (username, enabled) => {
  const [count, setCount] = React.useState(null)
  React.useEffect(() => {
    if(!enabled || !username)
      return
    let active = true
    Promise.all([
      APIService.users(username).appendToUrl('map-projects/').get(null, null, {limit: 1}, true),
      APIService.users(username).appendToUrl('orgs/map-projects/').get(null, null, {limit: 1}, true),
    ]).then(responses => {
      if(active)
        setCount(projectCount(...responses))
    }).catch(() => {})
    return () => { active = false }
  }, [username, enabled])
  return count
}

export default useMapProjectCount
