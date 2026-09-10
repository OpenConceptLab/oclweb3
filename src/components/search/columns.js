import { filter, reject, find, sortBy, get, keys, without, startCase } from 'lodash';

import { ALL_COLUMNS } from './ResultConstants';

/*
 * Resolves the columns a result table actually renders for a resource.
 *
 * A repo's configured `properties` replace the property-backed columns
 * (concept class, datatype), which is why a column's label can differ from its
 * static translation - the sort menu reads labels from here so the two agree.
 */
/*
 * Sort fields that address the same column. The display name column is sorted
 * on `name` from its own header and on `_name` from the sort menu inside a
 * repo - both are valid API fields, so either has to light the column up.
 */
const SORT_FIELD_ALIASES = [['name', '_name']]

export const isSameSortField = (a, b) => {
  if(!a || !b)
    return false
  if(a === b)
    return true
  return SORT_FIELD_ALIASES.some(group => group.includes(a) && group.includes(b))
}

export const resolveColumns = ({resource, nested, baseURL, excludedColumns, extraColumns, properties, propertyDefinition, propertyFilters}) => {
  const isSourceNested = baseURL?.includes('/sources/') && nested
  let columns = filter(
    ALL_COLUMNS[resource] || [],
    column => nested ? (!isSourceNested || column.nested !== false) : column.global !== false
  );
  if(extraColumns?.length)
    columns = [...columns, ...extraColumns]
  columns = excludedColumns?.length ? reject(columns, column => excludedColumns?.includes(column.id)) : columns
  if(properties?.length) {
    columns = reject(columns, {property: true})
    const variableColumnIds = columns.map(col => col.id)
    let customProperties = reject(properties, property => variableColumnIds.includes(property))
    customProperties.forEach(property => {
      const prop = find(propertyDefinition, {code: property})
      columns.push({
        id: property,
        label: prop?.display || startCase(property),
        className: 'searchable',
        sortable: Boolean(find(propertyFilters, {code: property})),
        sortBy: `properties.${property}.keyword`,
        renderer: item => {
          let prop = find(item.property, {code: property})
          if(prop) {
            let k = get(without(keys(prop), 'code'), '0')
            return get(prop, k)
          }
          return undefined
        }
      })
    })
    columns = sortBy(columns, column => {
      const idx = properties.indexOf(column.id);
      if(idx === -1)
        return properties.length
      column.isProperty = true
      return idx
    });
    columns = [...filter(columns, {permanent: true}), ...reject(columns, {permanent: true})]
  } else {
    columns = columns.map(column => {
      column.isProperty = false
      return column
    })
  }
  return columns
}
