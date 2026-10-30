export const mergeProjects = (...lists) => {
  const byUrl = new Map()
  lists.forEach(list => {
    if(Array.isArray(list))
      list.forEach(project => { if(!byUrl.has(project.url)) byUrl.set(project.url, project) })
  })
  return [...byUrl.values()]
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
