import get from 'lodash/get';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import keys from 'lodash/keys';
import startCase from 'lodash/startCase';

export const REPO_VERSIONS_PAGE_SIZE = 25;

export const headerCellSx = {
  backgroundColor: 'background.paper',
  borderBottom: '1px solid',
  borderColor: 'surface.nv80',
  color: 'surface.contrastText',
  fontSize: '12px',
  fontWeight: 'bold',
  lineHeight: '1.2rem',
  padding: '3px 16px'
};

export const bodyCellSx = {
  borderBottom: '1px solid',
  borderColor: 'surface.nv80',
  verticalAlign: 'middle'
};

export const isHeadVersion = version => (version?.version || version?.id) === 'HEAD';
export const getVersionKey = version => version?.version_url || version?.url || version?.id;
export const getVersionLabel = version => version?.version || version?.id || '-';
export const getVersionURL = version => isHeadVersion(version) ? `${version?.version_url || version?.url}HEAD/` : version?.version_url || version?.url;
export const getPreviousVersionURL = version => version?.previous_version_url;
export const getContentCount = (version, field) => get(version, `summary.${field}`);
export const formatCount = value => isNumber(value) ? value.toLocaleString() : '-';
export const formatError = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.detail || value.error || value.__all__ || fallback;
};

const VERSION_ATTRIBUTE_LABEL_KEYS = {
  id: 'common.id',
  version: 'common.version',
  short_code: 'common.short_code',
  description: 'common.description',
  external_id: 'common.external_id',
  public_access: 'common.access_level',
  released: 'common.released',
  retired: 'common.retired',
  autoexpand: 'repo.autoexpand',
  expansion_url: 'repo.expansion_url',
  revision_date: 'repo.revision_date',
  extras: 'custom_attributes.label',
  'checksums.standard': 'checksums.standard',
  'checksums.smart': 'checksums.smart',
  version_url: 'repo.version_url',
  url: 'common.api_url',
  previous_version_url: 'repo.previous_version_url',
  summary: 'common.summary',
  created_on: 'common.created_on',
  created_by: 'common.created_by',
  updated_on: 'common.updated_on',
  updated_by: 'common.updated_by'
};

const VERSION_ATTRIBUTE_TYPES = {
  extras: 'json',
  summary: 'json',
  identifier: 'json',
  contact: 'json',
  jurisdiction: 'json',
  meta: 'json',
  properties: 'table',
  filters: 'table',
  revision_date: 'date',
  created_on: 'datetime',
  updated_on: 'datetime',
  created_by: 'user',
  updated_by: 'user'
};

// Shown first, in this order. Everything else the version carries is appended
// after these, so the dialog never hides an attribute the API returned.
const VERSION_ATTRIBUTE_ORDER = [
  'id',
  'version',
  'short_code',
  'description',
  'external_id',
  'public_access',
  'released',
  'retired',
  'autoexpand',
  'expansion_url',
  'revision_date',
  'extras',
  'checksums.standard',
  'checksums.smart',
  'version_url',
  'url',
  'previous_version_url',
  'summary',
  'created_on',
  'created_by',
  'updated_on',
  'updated_by'
];

// 'type' titles the dialog and 'checksums' is already split into its two entries.
const VERSION_ATTRIBUTE_SKIPPED = ['type', 'checksums'];

export const getVersionAttributeFields = (version, t) => {
  const rest = keys(version).filter(
    field => !VERSION_ATTRIBUTE_ORDER.includes(field) && !VERSION_ATTRIBUTE_SKIPPED.includes(field)
  );
  const fields = {};
  [...VERSION_ATTRIBUTE_ORDER, ...rest].forEach(field => {
    const labelKey = VERSION_ATTRIBUTE_LABEL_KEYS[field];
    const value = get(version, field);
    const info = { label: labelKey ? t(labelKey) : startCase(field) };
    const type = VERSION_ATTRIBUTE_TYPES[field] || (isObject(value) ? 'json' : undefined);
    if(type)
      info.type = type;
    // the dialog renders a value only when it is truthy, so true/false needs a string
    if(isBoolean(value))
      info.value = value.toString();
    fields[field] = info;
  });
  return fields;
};

// Matches how a concept row stays highlighted while its details are open, so it is
// obvious which version an open row menu belongs to.
export const menuOpenRowSx = {
  '&.Mui-selected': { backgroundColor: 'surface.main' },
  '&.Mui-selected.MuiTableRow-hover:hover': { backgroundColor: 'surface.main' }
};
