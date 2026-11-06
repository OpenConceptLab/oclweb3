// How a new collection version's expansion is chosen. The popup is asked only with the lock toggle on.
export const shouldAskForExpansion = ({edit, isCollection, lockToggle}) => Boolean(!edit && isCollection && lockToggle)

export const shouldShowAutoexpand = ({edit, isCollection, lockToggle}) => Boolean(isCollection && (edit || !lockToggle))

export const getExpansionChoices = ({lockToggle, headExpansionURL}) =>
  lockToggle && headExpansionURL ? ['lock', 'latest', 'none'] : ['latest', 'none']

export const getDefaultExpansion = args => getExpansionChoices(args)[0]

export const getExpansionPayload = expansion => expansion ? {expansion, autoexpand: expansion !== 'none'} : {}
