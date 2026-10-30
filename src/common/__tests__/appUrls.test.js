import test from 'node:test'
import assert from 'node:assert/strict'

const { resolveMapperURL, PRODUCTION_MAPPER_URL } = await import('../appUrls.js')

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

test('localhost and custom hosts without configuration point to production', () => {
  assert.equal(resolveMapperURL('', 'http://localhost:4002'), PRODUCTION_MAPPER_URL)
  assert.equal(resolveMapperURL('', 'https://terms.example.org'), PRODUCTION_MAPPER_URL)
  assert.equal(resolveMapperURL('', undefined), PRODUCTION_MAPPER_URL)
})
