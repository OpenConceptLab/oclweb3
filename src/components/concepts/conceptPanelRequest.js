import { getResourceIdFromUrl, toParentURI } from '../../common/uri.js'

// A panel builds its request while its state still holds the concept it showed before, so the new selection comes first
const getRequestedConcept = (selected, loaded) => selected?.id ? selected : loaded

export const getRequestedConceptId = (url, selected, loaded) =>
  getResourceIdFromUrl(url, 'concepts') || getRequestedConcept(selected, loaded)?.id

// The repo version to read from, when the requested concept belongs to the repo at parentURL
export const getRequestedRepoVersion = (parentURL, selected, loaded) => {
  const concept = getRequestedConcept(selected, loaded)
  return toParentURI(concept?.url) === parentURL ? concept?.latest_source_version : undefined
}
