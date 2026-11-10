// A source version's match algorithms, as the API names them. `llm` is OCL Semantic Search: the version's concepts are
// vectorized. Adding or removing it on a version queues the API's vector sync (OpenConceptLab/ocl_online#46).
const TOKEN_MATCH_ALGORITHM = 'es'
const SEMANTIC_MATCH_ALGORITHM = 'llm'

export const isSemanticVersion = version => Boolean(version?.match_algorithms?.includes(SEMANTIC_MATCH_ALGORITHM))

// The algorithms with semantic search on or off, keeping the rest. With none left, `es`, as the API defaults.
export const withSemanticSearch = (algorithms, on) => {
  const rest = (algorithms || []).filter(algorithm => algorithm !== SEMANTIC_MATCH_ALGORITHM)
  const base = rest.length ? rest : [TOKEN_MATCH_ALGORITHM]
  return on ? [...base, SEMANTIC_MATCH_ALGORITHM] : base
}
