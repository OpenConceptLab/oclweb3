export const DEFAULT_LANGUAGE = 'en'

const baseOf = tag => tag.split('-')[0]

/*
 * Maps a BCP 47 tag (e.g. "pt-PT", "es_MX", "en-US") to one of the supported locales.
 * An exact match wins; otherwise the primary language code is matched, so any regional
 * variant of a supported language (pt-PT, es-AR, zh-TW, ...) resolves to it.
 */
export const matchLanguage = (tag, supported) => {
  if(typeof tag !== 'string' || !tag)
    return undefined

  const normalized = tag.trim().replace('_', '-').toLowerCase()
  return supported.find(locale => locale.toLowerCase() === normalized) ||
    supported.find(locale => baseOf(locale.toLowerCase()) === baseOf(normalized))
}

export const getStoredLanguage = (storage, key, supported) => {
  try {
    const stored = storage.getItem(key)
    return supported.includes(stored) ? stored : undefined
  } catch(_) {
    return undefined // storage unavailable (e.g. blocked or private mode)
  }
}

// navigator.languages is ordered by preference; the first tag that maps to a supported locale wins.
export const getBrowserLanguage = (nav, supported) => {
  const tags = nav?.languages?.length ? nav.languages : [nav?.language]
  for(const tag of tags) {
    const match = matchLanguage(tag, supported)
    if(match)
      return match
  }
  return undefined
}

/*
 * Runs the sources in priority order and returns the first locale found.
 * Each source is a function returning a supported locale or undefined, so a new
 * signal is added by appending one entry to the list.
 */
export const resolveLanguage = (sources, fallback = DEFAULT_LANGUAGE) => {
  for(const source of sources) {
    const language = source()
    if(language)
      return language
  }
  return fallback
}
