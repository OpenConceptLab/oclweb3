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
