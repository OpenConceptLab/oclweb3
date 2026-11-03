const OFFICIAL_ORIGIN = /^https:\/\/app\.(v3\.)?([a-z]+\.)*openconceptlab\.org$/

// TBv3 is at app.v3.<env> and TBv2 at app.v2.<env> (OpenConceptLab/ocl_online#236); app.<env> serves one of them.
// Every one of those hosts shares its environment's API at api.<env>.
export const toAPIOrigin = origin => origin.replace(/:\/\/app\.(v[23]\.)?/, '://api.')

export const resolveMapperURL = (configured, origin) => {
  const url = (configured || '').trim().replace(/\/+$/, '')
  if(url)
    return url
  if(OFFICIAL_ORIGIN.test(origin || ''))
    return origin.replace(/\/\/app\.(v3\.)?/, '//map.')
  return ''
}
