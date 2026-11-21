// What the About tab shows for a repository version (ocl_issues#1892) and whether it is Verified
// (ocl_issues#3025). Everything here reads the API's fields only; verification never comes from extras.

export const ABOUT_SECTIONS = ['verification', 'overview', 'source']

// Checks of each verification process, in display order. Each id is its section of the OCL Docs page.
export const VERIFICATION_PROCESS_CHECKS = {
  'ocl-verification-v1': [
    'from-the-publisher',
    'license-and-citation',
    'correctly-identified',
    'complete',
    'changes-listed',
    'checked-independently',
  ],
}

export const VERIFIED_REPOSITORIES_DOCS_URL = 'https://docs.openconceptlab.org/en/latest/oclonline/verified-repositories.html'

const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const asText = value => (typeof value === 'string' ? value.trim() : '')
const isHttpURL = value => /^https?:\/\//i.test(value)
const isEmail = value => /^[^\s@/:?#]+@[^\s@/:?#]+\.[^\s@/:?#]+$/.test(value)

export const getVerification = version => {
  const verification = version?.verification
  if(!isPlainObject(verification))
    return null
  return Object.values(verification).some(value => value !== null && value !== undefined && value !== '') ? verification : null
}

export const isVerified = version => Boolean(getVerification(version))

// A process may carry a terminology suffix after a dot (ocl_online#500); it has the base process's checks
export const getVerificationChecks = verification => {
  const process = typeof verification?.process === 'string' ? verification.process : ''
  return VERIFICATION_PROCESS_CHECKS[process] || VERIFICATION_PROCESS_CHECKS[process.split('.')[0]] || []
}

export const getVerificationNotes = version => asText(version?.extras?.verification_notes)

// "Changes listed" points at the notes below it, so without notes it says nothing is listed rather than promising a list
export const getCheckLineKey = (check, notes) => (check === 'changes-listed' && !notes ? 'line_no_changes' : 'line')

export const getOverviewText = repo => asText(repo?.text)

// Until repositories carry About text, the Overview falls back to the repository's description
export const getOverviewDescription = repo => (getOverviewText(repo) ? '' : asText(repo?.description))

const getContactItems = contact => {
  const contacts = Array.isArray(contact) ? contact : (isPlainObject(contact) || typeof contact === 'string' ? [contact] : [])
  return contacts.flatMap(item => {
    if(typeof item === 'string')
      return asText(item) ? [{text: asText(item)}] : []
    if(!isPlainObject(item))
      return []
    const name = asText(item.name)
    const telecom = Array.isArray(item.telecom) ? item.telecom : []
    const url = asText(telecom.find(entry => entry?.system === 'url' && asText(entry?.value))?.value)
    const email = asText(telecom.find(entry => entry?.system === 'email' && asText(entry?.value))?.value)
    // Only http(s) and plain email addresses become links, as for Website and Canonical URL
    let link = null
    if(url && isHttpURL(url))
      link = {text: url, href: url}
    else if(email && isEmail(email))
      link = {text: email, href: `mailto:${email}`}
    else if(url || email)
      link = {text: url || email}
    if(link)
      return [{...link, prefix: name ? `${name} · ` : ''}]
    return name ? [{text: name}] : []
  })
}

const getIdentifierItems = identifier => {
  const identifiers = Array.isArray(identifier) ? identifier : [identifier]
  return identifiers.flatMap(item => {
    if(typeof item === 'string')
      return asText(item) ? [{text: asText(item)}] : []
    const value = isPlainObject(item) ? asText(item.value) : ''
    return value ? [{text: value}] : []
  })
}

const linkItem = value => (isHttpURL(value) ? {text: value, href: value} : {text: value})

// Rows of the "Source and license" section: only fields with a value, written out rather than raw JSON.
// `release` carries the raw date; the component formats it.
export const getSourceRows = repo => {
  if(!repo)
    return []
  const version = asText(repo.version || repo.id)
  const releaseDate = asText(repo.revision_date)
  const rows = [
    {key: 'publisher', items: asText(repo.publisher) ? [{text: asText(repo.publisher)}] : []},
    {key: 'formal_name', items: asText(repo.full_name) && asText(repo.full_name) !== asText(repo.name) ? [{text: asText(repo.full_name)}] : []},
    {key: 'contact', items: getContactItems(repo.contact)},
    {key: 'website', items: asText(repo.website) ? [linkItem(asText(repo.website))] : []},
    {key: 'canonical_url', items: asText(repo.canonical_url) ? [linkItem(asText(repo.canonical_url))] : []},
    {key: 'oid', items: getIdentifierItems(repo.identifier)},
    {key: 'release', items: (version && version !== 'HEAD') || releaseDate ? [{release: true, text: version === 'HEAD' ? '' : version, date: releaseDate}] : []},
    {key: 'copyright', items: asText(repo.copyright) ? [{text: asText(repo.copyright)}] : []},
    {key: 'hierarchy', items: asText(repo.hierarchy_meaning) ? [{text: asText(repo.hierarchy_meaning), code: true}] : []},
  ]
  return rows.filter(row => row.items.length)
}

// Sections with content, in display order: Verification comes first when the version has a record.
export const getAboutSections = repo => ABOUT_SECTIONS.filter(section => {
  if(section === 'verification')
    return isVerified(repo)
  if(section === 'overview')
    return Boolean(getOverviewText(repo) || getOverviewDescription(repo))
  return getSourceRows(repo).length > 0
})

export const hasAboutContent = repo => getAboutSections(repo).length > 0
