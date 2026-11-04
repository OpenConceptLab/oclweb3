// A member of an org is its admin or a plain member. The API sends each member's role on the org's members list, and
// the requester's own role as the org's user_role.
export const ROLE_ADMIN = 'admin'
export const ROLE_MEMBER = 'member'

// Staff and the org's admins can edit or delete it and manage its members. Any member can work on its repositories.
export const canAdministerOrg = (user, org) => Boolean(
  user?.is_staff || user?.is_superuser || org?.user_role === ROLE_ADMIN
)

// What saving the members dialog has to send, given the org's members, the members selected and the roles picked by
// username: [grants, revocations]. Grants go first, so that an org doesn't run out of admins half way through.
export const getMemberChanges = (members, selected, roles) => {
  const grants = []
  const revocations = []
  selected.forEach(member => {
    const current = members.find(({username}) => username === member.username)
    const role = roles[member.username] || member.role || ROLE_MEMBER
    if(!current)
      grants.push({member, action: 'add', role})
    else if(role !== (current.role || ROLE_MEMBER))
      (role === ROLE_ADMIN ? grants : revocations).push({member, action: 'role', role})
  })
  members.forEach(member => {
    if(!selected.some(({username}) => username === member.username))
      revocations.push({member, action: 'remove', role: undefined})
  })
  return [grants, revocations]
}
