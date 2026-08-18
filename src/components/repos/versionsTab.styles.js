import get from 'lodash/get';
import isNumber from 'lodash/isNumber';

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
