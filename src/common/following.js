// A user's own following list keeps follows of objects they can no longer view, with no object.
export const getFollowedObjects = following => (following || []).map(follow => follow?.object).filter(Boolean)

export const getFollowsWithObject = following => (following || []).filter(follow => follow?.object)
