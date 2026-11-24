import test from 'node:test'
import assert from 'node:assert/strict'

const {
  normalizeNotice, getNotice, getNoticeDetail, getNotices, orderActions, getNoticeTone, getNoticeIcon, getLocks,
  getLockTooltip, isEntryPointLocked, safeURL, writesShownVersion, ENTRY_POINT_ACTIONS, WRITE_ACTIONS,
} = await import('../limitNoticePayload.js')

const NOTICE = {
  kind: 'cap',
  tone: 'error',
  scope_type: 'organization',
  title: 'Example notice',
  scope: 'Example scope',
  meter: {label: 'Example meter', fraction: 1, tone: 'error'},
  reset: 'Example reset',
  restricted: 'Example restriction',
  still_works: 'Example of what still works',
  managed_by: 'Example managers',
  actions: [
    {label: 'Example details', url: 'https://example.org/details', kind: 'secondary'},
    {label: 'Example way out', url: 'https://example.org/way-out', kind: 'primary'},
  ],
  help: {label: 'Example help', url: 'https://example.org/help'},
}

test('a full notice is kept as sent', () => {
  assert.deepEqual(normalizeNotice(NOTICE), NOTICE)
})

test('fields the slot does not know are dropped, and empty ones too', () => {
  const notice = normalizeNotice({...NOTICE, extra: 'x', scope: '  ', reset: 42, meter: undefined, html: '<b>x</b>'})
  assert.equal(notice.extra, undefined)
  assert.equal(notice.html, undefined)
  assert.equal(notice.scope, undefined)
  assert.equal(notice.reset, undefined)
  assert.equal(notice.meter, undefined)
  assert.equal(notice.title, 'Example notice')
})

test('no usable notice without a title', () => {
  assert.equal(normalizeNotice(null), null)
  assert.equal(normalizeNotice('Example notice'), null)
  assert.equal(normalizeNotice([NOTICE]), null)
  assert.equal(normalizeNotice({...NOTICE, title: ''}), null)
  assert.equal(normalizeNotice({...NOTICE, title: undefined}), null)
})

test('only http(s) links are kept, and an action or help link needs one', () => {
  assert.equal(safeURL('https://example.org/a'), 'https://example.org/a')
  assert.equal(safeURL('http://example.org/a'), 'http://example.org/a')
  // eslint-disable-next-line spellcheck/spell-checker
  assert.equal(safeURL('javascript:alert(1)'), null)
  assert.equal(safeURL('data:text/html,hi'), null)
  assert.equal(safeURL('/relative/path'), null)
  assert.equal(safeURL(undefined), null)
  const notice = normalizeNotice({
    ...NOTICE,
    // eslint-disable-next-line spellcheck/spell-checker
    actions: [{label: 'Bad', url: 'javascript:void(0)', kind: 'primary'}, {label: '', url: 'https://example.org/'}, {label: 'No link'}],
    help: {label: 'Example help', url: 'ftp://example.org/help'},
  })
  assert.equal(notice.actions, undefined)
  assert.equal(notice.help, undefined)
})

test('an unknown action kind falls back to secondary', () => {
  const notice = normalizeNotice({...NOTICE, actions: [{label: 'Example', url: 'https://example.org/', kind: 'loud'}]})
  assert.deepEqual(notice.actions, [{label: 'Example', url: 'https://example.org/', kind: 'secondary'}])
})

test('the meter fraction is clamped, and drives no bar unless it is a number', () => {
  assert.equal(normalizeNotice({...NOTICE, meter: {label: 'x', fraction: 1.7}}).meter.fraction, 1)
  assert.equal(normalizeNotice({...NOTICE, meter: {label: 'x', fraction: -0.2}}).meter.fraction, 0)
  assert.deepEqual(normalizeNotice({...NOTICE, meter: {label: 'x', fraction: '0.5'}}).meter, {label: 'x'})
  assert.deepEqual(normalizeNotice({...NOTICE, meter: {label: 'x', fraction: NaN, tone: 'loud'}}).meter, {label: 'x'})
  assert.equal(normalizeNotice({...NOTICE, meter: {}}).meter, undefined)
})

test('unknown kinds, tones and scope types are dropped', () => {
  const notice = normalizeNotice({...NOTICE, kind: 'other', tone: 'loud', scope_type: 'planet'})
  assert.equal(notice.kind, undefined)
  assert.equal(notice.tone, undefined)
  assert.equal(notice.scope_type, undefined)
})

test('locks keep only oclapi2 write actions, once each', () => {
  assert.deepEqual(WRITE_ACTIONS, ['edit', 'publish', 'delete', 'make_private'])
  assert.deepEqual(normalizeNotice({...NOTICE, locks: ['edit', 'edit', 'export', 'delete']}).locks, ['edit', 'delete'])
  assert.equal(normalizeNotice({...NOTICE, locks: 'edit'}).locks, undefined)
})

test('the notice is read from an axios error, a response or the body', () => {
  const body = {detail: 'Example detail', error_code: 'example_code', notice: NOTICE}
  assert.equal(getNotice({response: {status: 403, data: body}}).title, 'Example notice')
  assert.equal(getNotice({status: 403, data: body}).title, 'Example notice')
  assert.equal(getNotice(body).title, 'Example notice')
  assert.equal(getNotice({detail: 'Example detail'}), null)
  assert.equal(getNotice({status: 200, data: [{id: 1}]}), null)
  assert.equal(getNotice('Network Error'), null)
  assert.equal(getNotice(undefined), null)
})

test('with no notice, the API detail is what is shown', () => {
  assert.equal(getNoticeDetail({response: {data: {detail: 'Example detail'}}}), 'Example detail')
  assert.equal(getNoticeDetail({detail: 'Example detail'}), 'Example detail')
  assert.equal(getNoticeDetail({error: 'Example error'}), 'Example error')
  assert.equal(getNoticeDetail('Example message'), 'Example message')
  assert.equal(getNoticeDetail({}), null)
})

test('the notices route answer keeps usable notices only', () => {
  assert.deepEqual(getNotices({notices: [NOTICE, {title: ''}, null]}), [NOTICE])
  assert.deepEqual(getNotices({notices: []}), [])
  assert.deepEqual(getNotices({detail: 'Not found.'}), [])
  assert.deepEqual(getNotices(undefined), [])
})

test('the way out leads: first in a strip or an inline notice, rightmost in a dialog', () => {
  const [details, wayOut] = NOTICE.actions
  assert.deepEqual(orderActions(NOTICE.actions, 'strip'), [wayOut, details])
  assert.deepEqual(orderActions(NOTICE.actions, 'inline'), [wayOut, details])
  assert.deepEqual(orderActions(NOTICE.actions, 'dialog'), [details, wayOut])
  assert.deepEqual(orderActions(undefined, 'dialog'), [])
  assert.deepEqual(NOTICE.actions, [details, wayOut])
})

test('tone and icon come from the payload', () => {
  assert.equal(getNoticeTone({tone: 'warning'}), 'warning')
  assert.equal(getNoticeTone({meter: {tone: 'error'}}), 'error')
  assert.equal(getNoticeTone({}), 'info')
  assert.equal(getNoticeIcon({kind: 'read_only', tone: 'error'}), 'lock')
  assert.equal(getNoticeIcon({kind: 'not_included', tone: 'error'}), 'info')
  assert.equal(getNoticeIcon({kind: 'cap', tone: 'error'}), 'error')
  assert.equal(getNoticeIcon({kind: 'quota', tone: 'warning'}), 'warning')
  assert.equal(getNoticeIcon({kind: 'quota'}), 'info')
})

test('locks and their tooltip come from the resource notices', () => {
  const notices = [{title: 'a'}, {title: 'b', locks: ['edit'], tooltip: 'Example tooltip'}, {title: 'c', locks: ['delete', 'edit']}]
  assert.deepEqual(getLocks(notices), ['edit', 'delete'])
  assert.equal(getLockTooltip(notices), 'Example tooltip')
  assert.deepEqual(getLocks([]), [])
  assert.equal(getLockTooltip(undefined), null)
})

test('an entry point is locked only when every action it can take is locked', () => {
  assert.equal(isEntryPointLocked(['edit'], 'addConcept'), true)
  assert.equal(isEntryPointLocked(['edit'], 'deleteVersion'), true)
  assert.equal(isEntryPointLocked(['edit'], 'deleteRepo'), false)
  assert.equal(isEntryPointLocked(['delete'], 'deleteRepo'), true)
  // the edit form can still publish a repository, so an edit lock alone leaves it open
  assert.equal(isEntryPointLocked(['edit'], 'editRepo'), false)
  assert.equal(isEntryPointLocked(['edit', 'publish', 'make_private'], 'editRepo'), true)
  assert.equal(isEntryPointLocked([], 'addConcept'), false)
  assert.equal(isEntryPointLocked(undefined, 'addConcept'), false)
  assert.equal(isEntryPointLocked(['edit'], 'copyURL'), false)
  assert.equal(isEntryPointLocked(['edit'], 'saveDefaultFilters'), true)
  assert.equal(isEntryPointLocked(['edit'], 'removeReferences'), true)
  Object.values(ENTRY_POINT_ACTIONS).forEach(actions => actions.forEach(action => assert.ok(WRITE_ACTIONS.includes(action), action)))
})

test('the repository edit form can still publish; the version form only edits', () => {
  assert.equal(isEntryPointLocked(['edit'], 'editRepo'), false)
  assert.equal(isEntryPointLocked(['edit', 'publish'], 'editRepo'), false)
  assert.equal(isEntryPointLocked(['edit'], 'editVersion'), true)
  assert.equal(isEntryPointLocked(['publish', 'make_private'], 'editVersion'), false)
})

test('version writes follow the version shown; everything else follows HEAD', () => {
  ;['editVersion', 'releaseVersion', 'deleteVersion', 'saveDefaultFilters'].forEach(entryPoint => assert.equal(writesShownVersion(entryPoint), true, entryPoint))
  ;['editRepo', 'deleteRepo', 'addConcept', 'createVersion', 'removeReferences', 'createSimilar'].forEach(entryPoint => assert.equal(writesShownVersion(entryPoint), false, entryPoint))
})
