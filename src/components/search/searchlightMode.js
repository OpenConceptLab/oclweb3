// The search drawer keeps its own Searchlight mode ('query' | 'typeSelect' | 'typeBrowse'), but
// the active filter lives in SearchInput, which can set or clear it without the drawer: it
// re-derives a Class/Map Type filter from the URL (so Back, or any link without `filters`, clears
// it), and the closed search bar's chip has its own remove button. Keep the mode in step, or a
// cleared filter leaves the drawer browsing nothing, with the normal options (search this repo,
// $match) hidden. Clearing a filter from inside the drawer sets the mode in the same update
// (backspace steps back to 'typeSelect'), and that choice stands.
export const getModeForFilterType = (mode, activeFilterType) => {
  if(activeFilterType && mode === 'query')
    return 'typeBrowse'
  if(!activeFilterType && mode === 'typeBrowse')
    return 'query'
  return mode
}
