import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

// For pages that embed Search (repo pages, org and user repository lists): the filter
// panel starts open on wide screens and closed on narrow ones. Once the user opens or
// closes it, that choice is kept while the page stays mounted, including when Search
// remounts on a tab or version change. A window resize never opens or closes it.
// Returns [defaultFiltersOpen, onFiltersOpenChange] to pass to Search.
const useDefaultFiltersOpen = () => {
  // Search reads defaultFiltersOpen once, when it mounts, so the first render needs the real width.
  const isWide = useMediaQuery(theme => theme.breakpoints.up('lg'), {noSsr: true}) // eslint-disable-line spellcheck/spell-checker
  const [choice, setChoice] = React.useState(null)
  return [choice === null ? isWide : choice, setChoice]
}

export default useDefaultFiltersOpen;
