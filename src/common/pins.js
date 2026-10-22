// Pins are what a user or an org highlights on its own overview page.
// An owner is {type: 'user'|'org', id: <username|mnemonic>}.

export const getRepoPinOwner = repo => {
  if(!repo?.owner || !repo?.owner_type)
    return false
  return {type: repo.owner_type === 'Organization' ? 'org' : 'user', id: repo.owner}
}

// A pin highlights a repo, never one of its versions. A version's url is its repo's url, but its uuid is
// the version's own id, so a version page pins by url alone.
export const getRepoPinTarget = repo => {
  const isVersion = Boolean(repo?.version && repo.version !== 'HEAD')
  return {url: repo?.url, type: repo?.type?.replace(' Version', ''), uuid: isVersion ? undefined : repo?.uuid}
}

// The owning user, the org's members and staff can change an owner's pins.
export const canUserPinFor = (user, owner) => {
  if(!owner?.id || !user?.username)
    return false
  if(user.is_staff || user.is_superuser)
    return true
  return owner.type === 'org' ?
    (user.subscribed_orgs || []).some(org => org?.id === owner.id) :
    user.username === owner.id
}
