// A member of an org is its admin or a plain member. The API sends each member's role on the org's members list, and
// the requester's own role as the org's user_role.
export const ROLE_ADMIN = 'admin'
export const ROLE_MEMBER = 'member'

// Staff and the org's admins can edit or delete it and manage its members. Any member can work on its repositories.
export const canAdministerOrg = (user, org) => Boolean(
  user?.is_staff || user?.is_superuser || org?.user_role === ROLE_ADMIN
)

const findMember = (members, username) => members.find(member => member.username === username)

// The role picked in the members dialog, or else the member's own. A member selected from a user search carries none.
export const getMemberRole = (member, members, roles) => (
  (Object.hasOwn(roles, member.username) && roles[member.username]) || findMember(members, member.username)?.role || ROLE_MEMBER
)

// What saving the members dialog has to send, as batches to run in order: what gives rights, then what takes them away,
// so that an org doesn't run out of admins half way through, and last the requester's own loss of rights, which could
// stop them sending the rest.
export const getMemberChanges = (members, selected, roles, username) => {
  const grants = []
  const revocations = []
  const ownRevocations = []
  const revoke = change => (change.member.username === username ? ownRevocations : revocations).push(change)
  selected.forEach(member => {
    const current = findMember(members, member.username)
    const role = getMemberRole(member, members, roles)
    if(!current)
      grants.push({member, action: 'add', role})
    else if(role !== (current.role || ROLE_MEMBER)) {
      if(role === ROLE_ADMIN)
        grants.push({member, action: 'role', role})
      else
        revoke({member, action: 'role', role})
    }
  })
  members.forEach(member => {
    if(!findMember(selected, member.username))
      revoke({member, action: 'remove', role: undefined})
  })
  return [grants, revocations, ownRevocations]
}
