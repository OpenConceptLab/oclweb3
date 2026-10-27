// A limit refusal can come with a next step from the connected OCL Online
// service (OpenConceptLab/ocl_online#367). Open code shows only what the
// service sends; with no service configured it shows nothing.

// The capability each refusal is about, as the service names it.
const LIMIT_CAPABILITIES = {
  mapper_match_operations_limit_reached: 'mapper.match_operations',
  ai_assistant_calls_limit_reached: 'ai_assistant.calls',
  ai_assistant_change_comments_limit_reached: 'ai_assistant.change_comments',
  mapper_projects_limit_reached: 'mapper.projects',
  mapper_rows_per_project_limit_reached: 'mapper.rows_per_project',
  imports_file_size_limit_reached: 'imports.file_size_kb',
  clone_resources_per_call_limit_reached: 'clone.resources_per_call',
}

export const getLimitCapability = errorCode => LIMIT_CAPABILITIES[errorCode]

export const getLimitActionRequest = ({baseURL, token, errorCode, lang}) => {
  if(!baseURL || !token)
    return null
  return {
    url: `${baseURL.replace(/\/+$/, '')}/billing/plan/`,
    params: {context: 'limit', capability: getLimitCapability(errorCode), lang},
    headers: {Authorization: `Token ${token}`},
  }
}

// Only an http(s) link with a label becomes a button.
export const toLimitAction = data => {
  const { kind, url, label, message } = data?.action || {}
  if(typeof label !== 'string' || !label.trim() || typeof url !== 'string')
    return null
  let href
  try {
    href = new URL(url)
  } catch(_) {
    return null
  }
  if(!['https:', 'http:'].includes(href.protocol))
    return null
  return {kind, url: href.href, label, message: typeof message === 'string' && message.trim() ? message : null}
}
