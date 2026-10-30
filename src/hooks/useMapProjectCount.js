import React from 'react';
import APIService from '../services/APIService';
import { projectCount } from '../common/mapProjects';

// A user's count includes their organizations' projects, as their Mapping Projects tab does
const useMapProjectCount = (owner, enabled, ownerType = 'users') => {
  const [count, setCount] = React.useState(null)
  React.useEffect(() => {
    if(!enabled || !owner)
      return
    let active = true
    const requests = ownerType === 'orgs' ?
      [APIService.orgs(owner).appendToUrl('map-projects/').get(null, null, {limit: 1}, true)] :
      [
        APIService.users(owner).appendToUrl('map-projects/').get(null, null, {limit: 1}, true),
        APIService.users(owner).appendToUrl('orgs/map-projects/').get(null, null, {limit: 1}, true),
      ]
    Promise.all(requests).then(responses => {
      if(active)
        setCount(projectCount(...responses))
    }).catch(() => {})
    return () => { active = false }
  }, [owner, enabled, ownerType])
  return count
}

export default useMapProjectCount
