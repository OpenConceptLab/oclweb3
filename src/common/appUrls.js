export const PRODUCTION_MAPPER_URL = 'https://map.openconceptlab.org'

const OFFICIAL_ORIGIN = /^https:\/\/app\.(v3\.)?([a-z]+\.)*openconceptlab\.org$/

export const resolveMapperURL = (configured, origin) => {
  const url = (configured || '').trim().replace(/\/+$/, '')
  if(url)
    return url
  if(OFFICIAL_ORIGIN.test(origin || ''))
    return origin.replace(/\/\/app\.(v3\.)?/, '//map.')
  return PRODUCTION_MAPPER_URL
}
