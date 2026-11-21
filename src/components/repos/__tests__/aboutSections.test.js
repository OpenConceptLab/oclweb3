import test from 'node:test'
import assert from 'node:assert/strict'

const {
  getAboutSections, getCheckLineKey, getOverviewDescription, getSourceRows, getVerification, getVerificationChecks, getVerificationNotes,
  hasAboutContent, isVerified
} = await import('../aboutSections.js')

const VERIFICATION = { verified_at: '2026-11-13T10:00:00Z', process: 'ocl-verification-v1', hash: 'sha256:0f1e' }

const ICD11 = {
  id: '2026-01',
  version: '2026-01',
  name: 'ICD-11-WHO',
  full_name: 'International Classification of Diseases, 11th Revision Mortality and Morbidity Statistics (MMS)',
  publisher: 'World Health Organization (WHO)',
  contact: [{ name: 'World Health Organization (WHO)', telecom: [{ system: 'url', value: 'https://www.who.int/' }] }],
  website: 'https://icd.who.int/browse/2026-01/mms/en',
  canonical_url: 'http://id.who.int/icd/release/11/mms',
  revision_date: '2026-01-17T00:00:00Z',
  identifier: {},
  copyright: '© World Health Organization (WHO) 2020.',
  hierarchy_meaning: 'grouped-by',
  text: '<p>WHO International Classification of Diseases</p>',
  verification: VERIFICATION,
  extras: { verification_notes: 'So that WHO\'s release can be browsed, OCL added:\n\n- A root concept' },
}

test('a version is verified only by its verification record, never by extras', () => {
  assert.equal(isVerified(ICD11), true)
  assert.equal(isVerified({ extras: { verification: VERIFICATION } }), false)
  assert.equal(isVerified({ verification: {} }), false)
  assert.equal(isVerified({ verification: { verified_at: null } }), false)
  assert.equal(isVerified({ verification: 'yes' }), false)
  assert.equal(isVerified(false), false)
  assert.deepEqual(getVerification(ICD11), VERIFICATION)
})

test('the checks belong to the process; an unknown process lists none', () => {
  assert.equal(getVerificationChecks(VERIFICATION).length, 6)
  assert.equal(getVerificationChecks(VERIFICATION)[0], 'from-the-publisher')
  assert.deepEqual(getVerificationChecks({ process: 'ocl-verification-v2' }), [])
  // A terminology suffix keeps the base process's checks (ocl_online#500, 19 Nov)
  assert.deepEqual(getVerificationChecks({ process: 'ocl-verification-v1.icd11' }), getVerificationChecks(VERIFICATION))
  assert.deepEqual(getVerificationChecks({ process: 'ocl-verification-v2.icd11' }), [])
})

test('the notes come from the version\'s verification_notes only', () => {
  assert.match(getVerificationNotes(ICD11), /^So that WHO/)
  assert.equal(getVerificationNotes({ extras: { verification_notes: '   ' } }), '')
  assert.equal(getVerificationNotes({}), '')
})

test('Verification comes first, then Overview and Source and license', () => {
  assert.deepEqual(getAboutSections(ICD11), ['verification', 'overview', 'source'])
})

test('each section shows only when it has content', () => {
  assert.deepEqual(getAboutSections({ text: '<p>About</p>' }), ['overview'])
  assert.deepEqual(getAboutSections({ publisher: 'Publisher name' }), ['source'])
  assert.deepEqual(getAboutSections({ id: 'HEAD', version: 'HEAD', text: '  ' }), [])
  assert.deepEqual(getAboutSections({ description: 'WHO ICD-11 MMS, release 2026-01' }), ['overview'])
  assert.equal(hasAboutContent({ id: 'HEAD', version: 'HEAD' }), false)
  assert.equal(hasAboutContent(false), false)
})

test('Source and license lists only fields with values, written out', () => {
  const rows = getSourceRows(ICD11)
  assert.deepEqual(rows.map(row => row.key), ['publisher', 'formal_name', 'contact', 'website', 'canonical_url', 'release', 'copyright', 'hierarchy'])
  assert.deepEqual(rows.find(row => row.key === 'contact').items, [{ text: 'https://www.who.int/', href: 'https://www.who.int/', prefix: 'World Health Organization (WHO) · ' }])
  assert.deepEqual(rows.find(row => row.key === 'release').items, [{ release: true, text: '2026-01', date: '2026-01-17T00:00:00Z' }])
})

test('HEAD has no release row unless it has a release date', () => {
  assert.equal(getSourceRows({ version: 'HEAD', publisher: 'X' }).some(row => row.key === 'release'), false)
  assert.deepEqual(getSourceRows({ version: 'HEAD', revision_date: '2026-01-17' }).find(row => row.key === 'release').items, [{ release: true, text: '', date: '2026-01-17' }])
})

test('the OID row reads the identifier in its common shapes', () => {
  const oid = repo => getSourceRows(repo).find(row => row.key === 'oid')?.items
  assert.deepEqual(oid({ identifier: { value: '2.16.840.1.113883.6.1' } }), [{ text: '2.16.840.1.113883.6.1' }])
  assert.deepEqual(oid({ identifier: [{ value: 'urn:oid:1.2.3' }, {}] }), [{ text: 'urn:oid:1.2.3' }])
  assert.equal(oid({ identifier: {} }), undefined)
})

test('a formal name equal to the name is not repeated', () => {
  assert.equal(getSourceRows({ name: 'CIEL', full_name: 'CIEL' }).length, 0)
})

test('contacts without a URL fall back to email, then to the name', () => {
  const contact = repo => getSourceRows(repo).find(row => row.key === 'contact')?.items
  assert.deepEqual(contact({ contact: [{ name: 'OCL', telecom: [{ system: 'email', value: 'a@b.org' }] }] }), [{ text: 'a@b.org', href: 'mailto:a@b.org', prefix: 'OCL · ' }])
  assert.deepEqual(contact({ contact: [{ name: 'OCL' }] }), [{ text: 'OCL' }])
  assert.equal(contact({ contact: {} }), undefined)
})

test('only http(s) URLs and plain email addresses become links', () => {
  const contact = repo => getSourceRows(repo).find(row => row.key === 'contact')?.items
  const website = repo => getSourceRows(repo).find(row => row.key === 'website')?.items
  // eslint-disable-next-line no-script-url, spellcheck/spell-checker
  assert.deepEqual(contact({ contact: [{ name: 'X', telecom: [{ system: 'url', value: 'javascript:alert(1)' }] }] }), [{ text: 'javascript:alert(1)', prefix: 'X · ' }])
  assert.deepEqual(contact({ contact: [{ telecom: [{ system: 'email', value: 'a@b.org?subject=x' }] }] }), [{ text: 'a@b.org?subject=x', prefix: '' }])
  // eslint-disable-next-line no-script-url, spellcheck/spell-checker
  assert.deepEqual(website({ website: 'javascript:alert(1)' }), [{ text: 'javascript:alert(1)' }])
})

test('the Overview uses the description only when there is no About text', () => {
  assert.equal(getOverviewDescription({ description: 'A description' }), 'A description')
  assert.equal(getOverviewDescription({ text: '<p>About</p>', description: 'A description' }), '')
})

test('the Overview text goes through the sanitizing markdown renderer, which drops scripts and event handlers', async () => {
  const { markdownToHtml } = await import('../../common/markdownPipeline.js')
  const html = markdownToHtml('<p>WHO</p><img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a>')
  assert.match(html, /WHO/)
  assert.doesNotMatch(html, /onerror|<script|javascript:/i)
})

test('"Differences listed" says none were found when there are no notes, and keeps its line otherwise', () => {
  assert.equal(getCheckLineKey('differences-listed', ''), 'line_no_changes')
  assert.equal(getCheckLineKey('differences-listed', '- A navigational root concept, `Root`, groups the chapters.'), 'line')
  assert.equal(getCheckLineKey('complete', ''), 'line')
})
