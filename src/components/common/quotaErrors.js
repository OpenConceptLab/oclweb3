export const QUOTA_PRICING_URL = 'https://preview.openconceptlab.org/pricing'
export const REQUEST_MORE_ACCESS_URL = 'mailto:jonathan@openconceptlab.org?subject=' + // eslint-disable-line spellcheck/spell-checker
  encodeURIComponent('OCL - request more access')

const QUOTA_ERRORS = {
  mapper_match_operations_limit_reached: {meter: 'match_operations', kind: 'quota'},
  ai_assistant_calls_limit_reached: {meter: 'ai_assistant_calls', kind: 'quota'},
  ai_assistant_change_comments_limit_reached: {meter: 'ai_assistant_change_comments', kind: 'quota'},
  mapper_projects_limit_reached: {meter: 'projects', kind: 'cap'},
  mapper_rows_per_project_limit_reached: {meter: 'rows', kind: 'cap'},
  imports_file_size_limit_reached: {meter: 'import_file_size', kind: 'limit'},
  clone_resources_per_call_limit_reached: {meter: 'clone_resources', kind: 'limit'},
}

const CAP_METERS = new Set(Object.values(QUOTA_ERRORS).filter(config => config.kind === 'cap').map(config => config.meter))
const LIMIT_METERS = new Set(Object.values(QUOTA_ERRORS).filter(config => config.kind === 'limit').map(config => config.meter))

export const isCapMeter = meter => CAP_METERS.has(meter)

export const isLimitMeter = meter => LIMIT_METERS.has(meter)

export const getQuotaError = value => {
  const data = value?.response?.data || value?.data || value
  const config = QUOTA_ERRORS[data?.error_code]
  if(!config)
    return null
  return {...config, errorCode: data.error_code, usage: {used: data.used, limit: data.limit, requested: data.requested}}
}

export const isQuotaError = value => Boolean(getQuotaError(value))
