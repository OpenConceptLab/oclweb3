import React from 'react';
import APIService from '../services/APIService';
import { projectCount } from '../common/mapProjects';

const CACHE_MS = 10000
const recent = {}

// The summary, left menu and remounts ask for the same counts, so one request serves them for a few seconds
const requestCount = (service, key) => {
  const cached = recent[key]
  if(cached && Date.now() - cached.at < CACHE_MS)
    return cached.request
  const request = service().get(null, null, {limit: 1}, true)
  recent[key] = {at: Date.now(), request}
  request.catch(() => { delete recent[key] })
  return request
}

// A user's count includes their organizations' projects, as their Mapping Projects tab does
const useMapProjectCount = (owner, enabled, ownerType = 'users') => {
  const [count, setCount] = React.useState(null)
  React.useEffect(() => {
    if(!enabled || !owner)
      return
    let active = true
    const requests = [requestCount(() => APIService[ownerType](owner).appendToUrl('map-projects/'), `${ownerType}/${owner}`)]
    if(ownerType === 'users')
      requests.push(requestCount(() => APIService.users(owner).appendToUrl('orgs/map-projects/'), `users/${owner}/orgs`))
    Promise.all(requests).then(responses => {
      if(active)
        setCount(projectCount(...responses))
    }).catch(() => {})
    return () => { active = false }
  }, [owner, enabled, ownerType])
  return count
}

export default useMapProjectCount
