/* global globalThis */
import test from 'node:test'
import assert from 'node:assert/strict'

globalThis.window = {location: {origin: ''}}

const { getEnv } = await import('../env.js')

// [getEnv(), getEnv(true)] for a page served from origin
const envAt = origin => {
  window.location.origin = origin
  return [getEnv(), getEnv(true)]
}

test('app.v3.openconceptlab.org is production', () => {
  assert.deepEqual(envAt('https://app.v3.openconceptlab.org'), ['production', ''])
})

test('app.v3.<env>.openconceptlab.org is that environment', () => {
  assert.deepEqual(envAt('https://app.v3.staging.openconceptlab.org'), ['staging', 'staging'])
  assert.deepEqual(envAt('https://app.v3.qa.openconceptlab.org'), ['qa', 'qa'])
  assert.deepEqual(envAt('https://app.v3.demo.openconceptlab.org'), ['demo', 'demo'])
  assert.deepEqual(envAt('https://app.v3.dev.openconceptlab.org'), ['dev', 'dev'])
  assert.deepEqual(envAt('https://app.v3.staging.who.openconceptlab.org'), ['staging-who', 'staging.who'])
})

test('app.openconceptlab.org, where TBv3 moves once it is the default Term Browser, is production', () => {
  assert.deepEqual(envAt('https://app.openconceptlab.org'), ['production', ''])
})

test('app.<env>.openconceptlab.org, where TBv3 moves once it is the default Term Browser, is that environment', () => {
  assert.deepEqual(envAt('https://app.staging.openconceptlab.org'), ['staging', 'staging'])
  assert.deepEqual(envAt('https://app.qa.openconceptlab.org'), ['qa', 'qa'])
  assert.deepEqual(envAt('https://app.demo.openconceptlab.org'), ['demo', 'demo'])
  assert.deepEqual(envAt('https://app.dev.openconceptlab.org'), ['dev', 'dev'])
  assert.deepEqual(envAt('https://app.staging.who.openconceptlab.org'), ['staging-who', 'staging.who'])
})

test('any other host is development', () => {
  assert.deepEqual(envAt('http://localhost:4002'), ['development', 'development'])
  assert.deepEqual(envAt('https://ocl.example.org'), ['development', 'development'])
})
