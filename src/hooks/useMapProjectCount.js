import React from 'react';
import APIService from '../services/APIService';
import { projectCount } from '../common/mapProjects';

const inFlight = {}

// The summary and left menu ask for the same counts at once, so they share one request until it settles
const requestCount = (service, key) => {
  if(inFlight[key])
    return inFlight[key]
  const request = service().get(null, null, {limit: 1}, true)
  inFlight[key] = request
  const clear = () => { delete inFlight[key] }
  request.then(clear, clear)
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
