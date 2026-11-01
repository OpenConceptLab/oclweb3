import test from 'node:test'
import assert from 'node:assert/strict'

const { resolveMapperURL, toAPIOrigin } = await import('../appUrls.js')

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
