import test from 'node:test'
import assert from 'node:assert/strict'

import { getStoredLanguage } from '../language.js'

const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'pt-BR']

test('falls through when the localStorage getter is blocked', () => {
  const blockedStorage = () => { throw new Error('SecurityError') }

  assert.equal(getStoredLanguage(blockedStorage, 'ocl.language', SUPPORTED_LANGUAGES), undefined)
})

test('reads a supported language from a lazy storage function', () => {
  const storage = () => ({ getItem: () => 'es' })

  assert.equal(getStoredLanguage(storage, 'ocl.language', SUPPORTED_LANGUAGES), 'es')
})
