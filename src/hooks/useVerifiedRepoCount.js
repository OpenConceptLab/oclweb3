import React from 'react';
import APIService from '../services/APIService';

// How many of an owner's repositories are verified (their latest released version is), from the verified filter's
// count; null until it's known or when it can't be (ocl_issues#3028)
const useVerifiedRepoCount = ownerURL => {
  const [count, setCount] = React.useState(null)
  React.useEffect(() => {
    setCount(null)
    if(!ownerURL)
      return undefined
    let alive = true
    APIService.new().overrideURL(ownerURL).appendToUrl('repos/').get(null, null, {verified: true, limit: 1}).then(response => {
      const total = parseInt(response?.headers?.num_found)
      if(alive)
        setCount(Number.isFinite(total) ? total : null)
    })
    return () => { alive = false }
  }, [ownerURL])
  return count
}

export default useVerifiedRepoCount;
