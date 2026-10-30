import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

// The list width at which a profile's repository list opens its filter panel by default
export const PROFILE_LIST_MIN_WIDTH = 1000

// For pages that embed Search (repo pages, org and user repository lists): the filter
// panel starts open when the list has room for it and closed when it doesn't. Repo pages
// go by the window (wide screens). Profiles share their width with the summary panel, so
// they pass minListWidth and put listRef on the list's container; the hook measures it,
// and defaultFiltersOpen is null until it has, so render Search once it isn't.
// The panel follows the window as it is resized until the person opens or closes it.
// Then that choice is kept while the page stays mounted, including when Search remounts
// on a tab or version change.
// Returns [defaultFiltersOpen, onFiltersOpenChange, listRef] to pass to Search.
const useDefaultFiltersOpen = minListWidth => {
  // Search reads defaultFiltersOpen when it mounts, so the first render needs the real width.
  const isWide = useMediaQuery(theme => theme.breakpoints.up('lg'), {noSsr: true}) // eslint-disable-line spellcheck/spell-checker
  const [listHasRoom, setListHasRoom] = React.useState(null)
  const [choice, setChoice] = React.useState(null)
  const observerRef = React.useRef(null)
  // A callback ref measures before the first paint, so Search mounts with the right default
  const listRef = React.useCallback(node => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if(!node || !minListWidth)
      return
    const update = () => setListHasRoom(node.getBoundingClientRect().width >= minListWidth)
    update()
    observerRef.current = new ResizeObserver(update)
    observerRef.current.observe(node)
  }, [minListWidth])
  const hasRoom = minListWidth ? listHasRoom : isWide
  return [choice === null ? hasRoom : choice, setChoice, listRef]
}

export default useDefaultFiltersOpen;
