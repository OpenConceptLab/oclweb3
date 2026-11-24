import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const i18next = (await import('i18next')).default
const { UNESCAPED } = await import('../referenceConversionUtils.js')

const translations = JSON.parse(
  readFileSync(new URL('../../../i18n/locales/en/translations.json', import.meta.url)).toString())
const i18n = i18next.createInstance()
await i18n.init({ lng: 'en', resources: { en: { translation: translations } } })

test('a version URL is shown as it is, not HTML-escaped', () => {
  const version = '/orgs/O/sources/S/v1/'

  assert.equal(i18n.t('reference.convert_resolves_to', { version, ...UNESCAPED }), `Resolves to ${version}`)
  // what the dialog showed before: i18next escapes each slash, and React then renders the entity as text
  assert.notEqual(i18n.t('reference.convert_resolves_to', { version }), `Resolves to ${version}`)
})

test('an expression in an aria-label and the rollback details keep their slashes', () => {
  const expression = '/orgs/O/sources/S/concepts/1/7/'

  assert.ok(i18n.t('reference.convert_choice_for', { expression, ...UNESCAPED }).includes(expression))
  assert.ok(i18n.t('reference.convert_rolled_back', { details: `${expression} failed`, ...UNESCAPED }).includes(expression))
})
