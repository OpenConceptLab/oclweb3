import React from 'react';
import { useTranslation } from 'react-i18next';
import APIService from '../services/APIService';
import { getCurrentUser } from '../common/utils';
import { canUserPinFor } from '../common/pins';
import { OperationsContext } from '../components/app/LayoutContext';

// Pins (a.k.a. bookmarks) are owned either by a user or by an org.
// owner is {type: 'user'|'org', id: <username|mnemonic>} or false when nothing is pinnable.
export const MAX_PINS_ALLOWED = 4;

const getService = (owner, pinId) => {
  if(!owner?.id || !owner?.type)
    return false
  const service = owner.type === 'org' ? APIService.orgs(owner.id) : APIService.users(owner.id)
  return service.pins(pinId)
}

export const canActOnPins = owner => canUserPinFor(getCurrentUser(), owner)

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
  const { t } = useTranslation()
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

  const fail = message => {
    setError(message || t('common.generic_error'))
    return false
  }
  const limitMessage = () => t('bookmarks.max_pins_reached', {max: MAX_PINS_ALLOWED, owner: ownerId, interpolation: {escapeValue: false}})

  // createPin and deletePin resolve to true once the change is saved.
  const createPin = item => {
    if(!canPin || !item?.url)
      return Promise.resolve(false)
    if((pins || []).length >= MAX_PINS_ALLOWED)
      return Promise.resolve(fail(limitMessage()))
    return resolveResourceId(item).then(resourceId => {
      if(!resourceId)
        return fail()
      return getService({type: ownerType, id: ownerId})
        .post({resource_type: item.type || item.repo_type, resource_id: resourceId})
        .then(response => {
          if(response?.status === 201 && response?.data?.id) {
            setPins(existing => [...(existing || []), response.data])
            return true
          }
          // The API answers {error: [...]} only when the owner already has the most pins allowed.
          return fail(response?.error ? limitMessage() : getErrorMessage(response))
        })
    })
  }

  const deletePin = pinId => {
    if(!canPin || !pinId)
      return Promise.resolve(false)
    return getService({type: ownerType, id: ownerId}, pinId).delete().then(response => {
      if(response?.status === 204) {
        setPins(existing => (existing || []).filter(pin => pin.id !== pinId))
        return true
      }
      return fail(getErrorMessage(response))
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
