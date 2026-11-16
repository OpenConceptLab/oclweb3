import test from 'node:test'
import assert from 'node:assert/strict'

const { resolveMapperURL, resolveTBv2URL, toAPIOrigin, toTBv2Path } = await import('../appUrls.js')

test('configured URL wins and loses its trailing slash', () => {
  assert.equal(resolveMapperURL('http://localhost:4004/', 'https://app.v3.qa.openconceptlab.org'), 'http://localhost:4004')
  assert.equal(resolveMapperURL(' https://mapper.example.org ', 'https://tb.example.org'), 'https://mapper.example.org')
})

test('official hosts map to the matching Mapper environment', () => {
  assert.equal(resolveMapperURL('', 'https://app.v3.openconceptlab.org'), 'https://map.openconceptlab.org')
  assert.equal(resolveMapperURL('', 'https://app.openconceptlab.org'), 'https://map.openconceptlab.org')
  assert.equal(resolveMapperURL('', 'https://app.v3.qa.openconceptlab.org'), 'https://map.qa.openconceptlab.org')
  assert.equal(resolveMapperURL(undefined, 'https://app.staging.openconceptlab.org'), 'https://map.staging.openconceptlab.org')
})

test('localhost, custom hosts and a missing origin have no Mapper without configuration', () => {
  assert.equal(resolveMapperURL('', 'http://localhost:4002'), '')
  assert.equal(resolveMapperURL('', 'https://terms.example.org'), '')
  assert.equal(resolveMapperURL('', 'https://app.example.org'), '')
  assert.equal(resolveMapperURL('', undefined), '')
})

test('every Term Browser host maps to its environment\'s API', () => {
  assert.equal(toAPIOrigin('https://app.openconceptlab.org'), 'https://api.openconceptlab.org')
  assert.equal(toAPIOrigin('https://app.v3.openconceptlab.org'), 'https://api.openconceptlab.org')
  assert.equal(toAPIOrigin('https://app.v2.openconceptlab.org'), 'https://api.openconceptlab.org')
  assert.equal(toAPIOrigin('https://app.v2.staging.openconceptlab.org'), 'https://api.staging.openconceptlab.org')
  assert.equal(toAPIOrigin('https://app.v3.qa.openconceptlab.org'), 'https://api.qa.openconceptlab.org')
  assert.equal(toAPIOrigin('https://api.openconceptlab.org'), 'https://api.openconceptlab.org')
})

test('TBv2: configured URL wins, official hosts map to app.v2 of the same environment', () => {
  assert.equal(resolveTBv2URL('https://tb2.example.org/', 'https://tb3.example.org'), 'https://tb2.example.org')
  assert.equal(resolveTBv2URL('', 'https://app.v3.openconceptlab.org'), 'https://app.v2.openconceptlab.org')
  assert.equal(resolveTBv2URL('', 'https://app.openconceptlab.org'), 'https://app.v2.openconceptlab.org')
  assert.equal(resolveTBv2URL(undefined, 'https://app.v3.qa.openconceptlab.org'), 'https://app.v2.qa.openconceptlab.org')
})

test('TBv2: localhost and custom hosts have no TBv2 without configuration', () => {
  assert.equal(resolveTBv2URL('', 'http://localhost:4002'), '')
  assert.equal(resolveTBv2URL('', 'https://terms.example.org'), '')
  assert.equal(resolveTBv2URL('', undefined), '')
})

test('TBv2 path: shared pages keep their path', () => {
  const same = [
    '/', '/search', '/imports', '/concepts/compare',
    '/orgs/CIEL', '/orgs/CIEL/edit', '/users/admin/settings',
    '/orgs/CIEL/sources/CIEL',
    '/orgs/CIEL/sources/CIEL/v2026-10-01',
    '/orgs/CIEL/sources/CIEL/concepts',
    '/orgs/CIEL/sources/CIEL/concepts/1066',
    '/orgs/CIEL/sources/CIEL/v2026-10-01/mappings/123',
    '/orgs/CIEL/sources/CIEL/about',
    '/users/admin/collections/vs/references',
    '/users/admin/collections/vs/v1/expansions/autoexpand-v1/concepts/1066',
  ]
  same.forEach(path => assert.equal(toTBv2Path(path), path, path))
})

test('TBv2 path: query strings and trailing slashes are dropped', () => {
  assert.equal(toTBv2Path('/search?q=malaria&type=concepts'), '/search')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/concepts/1066/'), '/orgs/CIEL/sources/CIEL/concepts/1066')
  assert.equal(toTBv2Path(''), '/')
  assert.equal(toTBv2Path(undefined), '/')
})

test('TBv2 path: pages TBv2 lacks fall back to the nearest page it has', () => {
  assert.equal(toTBv2Path('/url-registry'), '/')
  assert.equal(toTBv2Path('/admin/users/admin'), '/')
  assert.equal(toTBv2Path('/orgs/CIEL/url-registry'), '/orgs/CIEL')
  assert.equal(toTBv2Path('/users/admin/map-projects'), '/users/admin')
  assert.equal(toTBv2Path('/users/admin/usage'), '/users/admin')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/summary'), '/orgs/CIEL/sources/CIEL')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/v1/summary'), '/orgs/CIEL/sources/CIEL/v1')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/edit'), '/orgs/CIEL/sources/CIEL')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/compare-versions'), '/orgs/CIEL/sources/CIEL')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/v%201/concepts'), '/orgs/CIEL/sources/CIEL')
})

test('TBv2 path: expansions carry over for concepts and mappings, under HEAD when no version is named', () => {
  assert.equal(toTBv2Path('/orgs/o/collections/c/expansions/e1/concepts/1066'), '/orgs/o/collections/c/HEAD/expansions/e1/concepts/1066')
  assert.equal(toTBv2Path('/orgs/o/collections/c/v1/expansions/e1/mappings'), '/orgs/o/collections/c/v1/expansions/e1/mappings')
  assert.equal(toTBv2Path('/orgs/o/collections/c/v1/expansions/e1/references'), '/orgs/o/collections/c/v1/references')
  assert.equal(toTBv2Path('/orgs/o/collections/c/expansions/e1/references'), '/orgs/o/collections/c/references')
  assert.equal(toTBv2Path('/orgs/o/collections/c/v1/expansions/e1/summary'), '/orgs/o/collections/c/v1')
})

test('TBv2 path: a resource is carried only on concepts and mappings, and only if it is a plain id', () => {
  assert.equal(toTBv2Path('/orgs/o/collections/c/references/r1'), '/orgs/o/collections/c/references')
  assert.equal(toTBv2Path('/orgs/CIEL/sources/CIEL/concepts/a%2Fb'), '/orgs/CIEL/sources/CIEL/concepts')
})
