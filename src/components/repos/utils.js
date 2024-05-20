import {
  isEmpty, compact, map, find, reject, orderBy, uniqBy, filter, get, keys, isEqual
} from 'lodash';

export const sortValuesBySourceSummary = (data, summary, summaryField, isLocale) => {
  if(isEmpty(compact(data)) || !summary)
    return data
  let _data = compact(data).map(d => {
    d.resultType = 'Ordered'
    return d
  })
  const summaryValues = get(summary, summaryField)
  let suggested = []
  if(summaryValues) {
    const usedValues = map(summaryValues, value => value[0])
    usedValues.forEach(used => {
      const _used = find(_data, _d => {
        const id = _d?.id?.toLowerCase()?.replace('-', '')?.replace('_', '')?.replace(' ', '')
        const _used = used?.toLowerCase()?.replace('-', '')?.replace('_', '')?.replace(' ', '')
        return _used === id
      })
      if(_used) {
        suggested.push({..._used, resultType: 'Suggested'})
        _data = reject(_data, {id: _used?.id})
      }
    })
  }

  let values = [...suggested, ...orderBy(_data, 'name', 'asc')]

  if(isLocale) {
    values = uniqBy(
      [
        {...find(values, {id: summary.default_locale}), resultType: 'Suggested'},
        ...filter(
            values,
            val => (summary.supported_locales || []).includes(val.id)
        ).map(val => ({...val, resultType: 'Suggested'})),
        ...values
      ],
      'id'
    )
  }

  return reject(values, value => isEqual(keys(value), ['resultType']))
}
