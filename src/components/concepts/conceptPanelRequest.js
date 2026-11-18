import { getResourceIdFromUrl, toParentURI } from '../../common/uri.js'

// A panel builds its request while its state still holds the concept it showed before, so the new selection comes first.
// Its id also comes before the URL's, which a version URL or a concept with the id "concepts" can't give correctly.
export const getRequestedConceptId = (url, selected, loaded) =>
  selected?.id || getResourceIdFromUrl(url, 'concepts') || loaded?.id

// The repo version to read from, when the requested concept belongs to the repo at parentURL
export const getRequestedRepoVersion = (parentURL, selected, loaded) => {
  const concept = selected?.id ? selected : loaded
  return toParentURI(concept?.url) === parentURL ? concept?.latest_source_version : undefined
}

// Responses can arrive out of order: one to a request made for an earlier selection, or a closed panel, is dropped
export const createSelectionGuard = () => {
  let selection = 0
  return {
    onSelectionChange: () => { selection += 1 },
    forCurrentSelection: onResponse => {
      const requestedFor = selection
      return response => requestedFor === selection ? onResponse(response) : undefined
    },
  }
}
