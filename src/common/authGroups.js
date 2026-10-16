// Exact group-name checks, kept free of UI imports so they can be unit tested.
export const hasAuthGroup = (user, groupName) => Boolean(user?.auth_groups?.includes(groupName));
