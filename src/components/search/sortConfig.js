import { find } from 'lodash';

/*
 * Sort options for the search results Sort menu.
 *
 * A chip is the unit of sort state: it carries both the API sort field and the
 * direction, so the ID row's "0-9" chip can sort on numeric_id while its "A-Z"
 * chip sorts on id. Rows only group chips - the first chip of a row is that
 * row's default, which is what a click on the row itself applies.
 *
 * The orderBy values below are exactly what the previous menu emitted
 * (SORT_ATTRS entries lowercased), so the API contract is unchanged.
 */

/*
 * `columnId` ties a sort row to the table column it names, so the menu shows
 * whatever that column's header shows. `propertyBacked` marks the columns a
 * repo's configured properties replace - those rows disappear with the column.
 */
const FIELDS = {
  id: {labelKey: 'common.id', orderBy: 'id', columnId: 'id'},
  // concepts/mappings inside a repo can also sort on the numeric part of the ID
  id_numeric: {labelKey: 'common.id', orderBy: 'id', columnId: 'id', numericOrderBy: 'numeric_id'},
  name: {labelKey: 'common.name', orderBy: 'name', columnId: 'name'},
  display_name: {labelKey: 'concept.display_name', orderBy: 'name', columnId: 'name'},
  _display_name: {labelKey: 'concept.display_name', orderBy: '_name', columnId: 'name'},
  concept_class: {labelKey: 'concept.concept_class', orderBy: 'concept_class', columnId: 'concept_class', propertyBacked: true},
  datatype: {labelKey: 'concept.datatype', orderBy: 'datatype', columnId: 'datatype', propertyBacked: true},
  map_type: {labelKey: 'mapping.map_type', orderBy: 'map_type', columnId: 'mapType'},
  source: {labelKey: 'sort.source', orderBy: 'source', columnId: 'parent'},
  owner: {labelKey: 'common.owner', orderBy: 'owner', columnId: 'owner'},
  username: {labelKey: 'user.username', orderBy: 'username', columnId: 'username'},
  company: {labelKey: 'user.company', orderBy: 'company', columnId: 'company'},
  location: {labelKey: 'user.location', orderBy: 'location', columnId: 'location'},
  canonical_url: {labelKey: 'repo.canonical_url', orderBy: 'canonical_url', columnId: 'canonical_url'},
}

const RESOURCES = {
  global: {
    concepts: {relevance: true, fields: ['id', 'display_name', 'concept_class', 'datatype', 'source', 'owner']},
    mappings: {relevance: true, fields: ['id', 'map_type', 'source', 'owner']},
  },
  nested: {
    concepts: {relevance: true, dateField: 'last_update', fields: ['id_numeric', '_display_name', 'concept_class', 'datatype']},
    mappings: {relevance: true, dateField: 'last_update', fields: ['id', 'map_type']},
    // an org's/user's own repos - every row has the same owner, so no owner sort
    repos: {relevance: true, dateField: 'last_update', fields: ['id', 'name', 'canonical_url']},
  },
  common: {
    users: {
      relevance: true,
      dateField: 'date_joined',
      dateLabelKeys: ['sort.recently_joined', 'sort.longest_member'],
      fields: ['username', 'company', 'location'],
    },
    orgs: {relevance: true, dateField: 'last_update', fields: ['name', 'id']},
    repos: {relevance: true, dateField: 'last_update', fields: ['id', 'name', 'owner', 'canonical_url']},
  },
}

const alphaChips = orderBy => ([
  {orderBy: orderBy, order: 'asc', labelKey: 'sort.a_z', tooltipKey: 'sort.tooltip_a_z'},
  {orderBy: orderBy, order: 'desc', labelKey: 'sort.z_a', tooltipKey: 'sort.tooltip_z_a'},
])

const numericChips = orderBy => ([
  {orderBy: orderBy, order: 'asc', labelKey: 'sort.num_asc', tooltipKey: 'sort.tooltip_num_asc'},
  {orderBy: orderBy, order: 'desc', labelKey: 'sort.num_desc', tooltipKey: 'sort.tooltip_num_desc'},
])

/*
 * Returns {presets, fields} for the menu, or false when the resource has no
 * sort options. `hasSearchText` gates the relevance preset - without a query
 * there is nothing to be relevant to.
 */
export const getSortConfig = (resource, nested, hasSearchText, columns) => {
  const conf = (nested ? RESOURCES.nested[resource] : RESOURCES.global[resource]) || RESOURCES.common[resource]
  if(!conf)
    return false

  const presets = []
  if(conf.relevance && hasSearchText)
    presets.push({orderBy: 'score', order: 'desc', labelKey: 'sort.most_relevant'})
  if(conf.dateField) {
    const [newestKey, oldestKey] = conf.dateLabelKeys || ['sort.newest_first', 'sort.oldest_first']
    presets.push({orderBy: conf.dateField, order: 'desc', labelKey: newestKey})
    presets.push({orderBy: conf.dateField, order: 'asc', labelKey: oldestKey})
  }

  const fields = conf.fields.map(key => {
    const field = FIELDS[key]
    const column = columns?.length ? find(columns, {id: field.columnId}) : undefined
    // the repo's properties replaced this column - drop the row with it
    if(!column && field.propertyBacked && columns?.length)
      return false
    return {
      id: key,
      label: column?.label,
      labelKey: column?.labelKey || field.labelKey,
      chips: [...alphaChips(field.orderBy), ...(field.numericOrderBy ? numericChips(field.numericOrderBy) : [])],
    }
  }).filter(Boolean)

  return {presets: presets, fields: fields}
}

export const hasSortOptions = config => Boolean(config) && (config.presets.length + config.fields.length) > 0
