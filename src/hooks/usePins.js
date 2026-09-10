import React from 'react';
import APIService from '../services/APIService';
import {
  getCurrentUserUsername, isAdminUser, isCurrentUserMemberOf
} from '../common/utils';
import { OperationsContext } from '../components/app/LayoutContext';

// Pins (a.k.a. bookmarks) are owned either by a user or by an org.
// owner is {type: 'user'|'org', id: <username|mnemonic>} or false when nothing is pinnable.
export const PIN_RESOURCES = ['repos', 'orgs'];
export const MAX_PINS_ALLOWED = 4;

const getService = (owner, pinId) => {
  if(!owner?.id || !owner?.type)
    return false
  const service = owner.type === 'org' ? APIService.orgs(owner.id) : APIService.users(owner.id)
  return service.pins(pinId)
}

export const canActOnPins = owner => {
  if(!owner?.id || !getCurrentUserUsername())
    return false
  if(isAdminUser())
    return true
  return owner.type === 'org' ?
    isCurrentUserMemberOf(owner.id) :
    getCurrentUserUsername() === owner.id
}

// The pin API needs the resource's numeric PK, which list payloads don't carry.
const resolveResourceId = item => {
  if(item?.uuid)
    return Promise.resolve(item.uuid)
  if(!item?.url)
    return Promise.resolve(null)
  return APIService.new().overrideURL(item.url).get().then(response => response?.data?.uuid || null)
}

const getErrorMessage = response => {
  const error = response?.data?.error || response?.error
  if(error)
    return Array.isArray(error) ? error.join(' ') : error
  const all = response?.data?.__all__ || response?.__all__
  if(all)
    return Array.isArray(all) ? all.join(' ') : all
  return null
}

const usePins = owner => {
  const [pins, setPins] = React.useState(false)
  const [error, setError] = React.useState(false)
  const { setAlert } = React.useContext(OperationsContext) || {}
  const ownerType = owner?.type
  const ownerId = owner?.id
  const canPin = canActOnPins(owner)

  React.useEffect(() => {
    if(error && setAlert) {
      setAlert({severity: 'error', message: error, duration: 5000})
      setError(false)
    }
  }, [error])

  const fetchPins = React.useCallback(() => {
    const service = getService({type: ownerType, id: ownerId})
    if(!service)
      return setPins(false)
    service.get().then(response => setPins(response?.data?.length ? response.data : []))
  }, [ownerType, ownerId])

  React.useEffect(() => { fetchPins() }, [fetchPins])

  const findPin = item => (pins || []).find(pin => pin.resource_uri === item?.url)

  const createPin = item => {
    if(!canPin || !item?.url)
      return
    if((pins || []).length >= MAX_PINS_ALLOWED)
      return setError(`Can only keep max ${MAX_PINS_ALLOWED} items pinned`)
    resolveResourceId(item).then(resourceId => {
      if(!resourceId)
        return setError('Could not resolve the resource to pin')
      getService({type: ownerType, id: ownerId})
        .post({resource_type: item.type || item.repo_type, resource_id: resourceId})
        .then(response => {
          if(response?.status === 201 && response?.data?.id)
            setPins(existing => [...(existing || []), response.data])
          else
            setError(getErrorMessage(response) || 'Something went wrong while pinning')
        })
    })
  }

  const deletePin = pinId => {
    if(!canPin || !pinId)
      return
    getService({type: ownerType, id: ownerId}, pinId).delete().then(response => {
      if(response?.status === 204)
        setPins(existing => (existing || []).filter(pin => pin.id !== pinId))
      else
        setError(getErrorMessage(response) || 'Something went wrong while removing the pin')
    })
  }

  const togglePin = item => {
    const pin = findPin(item)
    return pin ? deletePin(pin.id) : createPin(item)
  }

  return {
    pins, canPin, findPin, createPin, deletePin, togglePin,
    error, resetError: () => setError(false), refresh: fetchPins
  }
}

export default usePins;
