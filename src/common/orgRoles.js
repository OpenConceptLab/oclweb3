// A member of an org is its admin or a plain member. The API sends each member's role on the org's members list, and
// the requester's own role as the org's user_role.
export const ROLE_ADMIN = 'admin'
export const ROLE_MEMBER = 'member'

const ROLE_LABEL_KEYS = {[ROLE_ADMIN]: 'org.admin', [ROLE_MEMBER]: 'org.member'}
export const ROLES = Object.keys(ROLE_LABEL_KEYS)

// A role this app doesn't know yet shows as the API sent it
export const getRoleLabel = (role, t) => Object.prototype.hasOwnProperty.call(ROLE_LABEL_KEYS, role) ? t(ROLE_LABEL_KEYS[role]) : role

const findMember = (members, username) => members.find(member => member.username === username)

// A role picked in the members dialog is on the selected member. One selected from a user search carries none.
export const getMemberRole = (member, members) => (
  member.role || findMember(members, member.username)?.role || ROLE_MEMBER
)

// What saving the members dialog has to send, as batches to run in order: what gives rights, then what takes them away,
// so that an org doesn't run out of admins half way through, and last the requester's own loss of rights, which could
// stop them sending the rest.
export const getMemberChanges = (members, selected, username) => {
  const grants = []
  const revocations = []
  const ownRevocations = []
  const revoke = change => (change.member.username === username ? ownRevocations : revocations).push(change)
  selected.forEach(member => {
    const current = findMember(members, member.username)
    const role = getMemberRole(member, members)
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
