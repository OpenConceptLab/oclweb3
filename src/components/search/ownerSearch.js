// On a user or organization profile, the search drawer's owner option searches
// what the open tab lists: the Mapping Projects tab filters its own list, and
// every other tab searches the owner's repositories.
export const getOwnerSearchScope = pathname => {
  const [, ownerType, owner, tab] = (pathname || '').split('/')
  if(!['users', 'orgs'].includes(ownerType) || !owner)
    return null
  return tab === 'map-projects' ? 'map-projects' : 'repos'
}
