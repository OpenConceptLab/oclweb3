export const mergeProjects = (...lists) => {
  const seen = new Set()
  return lists.flat().filter(project => !seen.has(project.url) && seen.add(project.url))
}

export const projectCount = (...responses) => responses.reduce(
  (total, response) => total + (parseInt(response?.headers?.num_found) || 0),
  0
)

// Mapping projects are private: only their owner, members of the owning
// organization and staff can see them, so only they get the profile tab.
export const canSeeMapProjects = (currentUser, ownerType, owner) => {
  if(!currentUser?.username || !owner)
    return false
  if(currentUser.is_staff)
    return true
  if(ownerType === 'users')
    return currentUser.username === owner
  if(ownerType === 'orgs')
    return Boolean(currentUser.subscribed_orgs?.some(org => org?.id === owner))
  return false
}

// The API can't search mapping projects, so the profile tab filters the
// list it loaded, by name and ID.
export const filterProjects = (projects, query) => {
  const term = (query || '').trim().toLowerCase()
  if(!term || !Array.isArray(projects))
    return projects
  return projects.filter(project => [project.name, project.id].some(value => String(value ?? '').toLowerCase().includes(term)))
}

// Loads every page of a mapping-project list (up to maxPages). A page that fails
// rejects the whole load, so a partial list never shows as if it were complete.
export const fetchAllPages = (getPage, maxPages, page = 1, loaded = []) => getPage(page).then(response => {
  if(!(response?.status >= 200 && response.status < 300))
    throw new Error(`Mapping projects page ${page} could not be loaded`)
  const all = [...loaded, ...(Array.isArray(response.data) ? response.data : [])]
  return response.headers?.next && page < maxPages ? fetchAllPages(getPage, maxPages, page + 1, all) : all
})
