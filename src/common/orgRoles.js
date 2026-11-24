// A member of an org is its admin or a plain member. The API sends each member's role on the org's members list, and
// the requester's own role as the org's user_role.
export const ROLE_ADMIN = 'admin'
export const ROLE_MEMBER = 'member'

const ROLE_LABEL_KEYS = {[ROLE_MEMBER]: 'org.member', [ROLE_ADMIN]: 'org.admin'}
export const ROLES = Object.keys(ROLE_LABEL_KEYS)

const isKnownRole = role => Object.prototype.hasOwnProperty.call(ROLE_LABEL_KEYS, role)

// A role this app doesn't know yet shows as the API sent it
export const getRoleLabel = (role, t) => isKnownRole(role) ? t(ROLE_LABEL_KEYS[role]) : role

// What a member's role dropdown offers: the roles this app knows, and the member's own if it isn't one of them
export const getRoleOptions = role => (role && !isKnownRole(role)) ? [...ROLES, role] : ROLES

// The change would take admin rights from the user making it
export const demotesSelf = (member, role, username) => Boolean(username) && member?.username === username && member?.role === ROLE_ADMIN && role !== ROLE_ADMIN
export const withoutMembers = (users, members) => {
  const usernames = new Set((members || []).map(member => member.username))
  return (users || []).filter(user => !usernames.has(user.username))
}
