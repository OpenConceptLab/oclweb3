import packageJson from '../../package.json';

export const LANGUAGES = [
  {locale: 'en', name: 'English'},
  {locale: 'es', name: "Español"}
]


export const DATE_FORMAT = 'M/D/YYYY';
export const TIME_FORMAT = 'h:mm A';
export const DATETIME_FORMAT = DATE_FORMAT + ' ' + TIME_FORMAT;
export const DEFAULT_LIMIT = 25;
// The API's search index cannot return results past this offset -- only plain,
// unfiltered, unsorted listings (served from the DB) can be paged beyond it.
export const MAX_SEARCH_RESULT_WINDOW = 10000;
export const EMPTY_VALUE = '-';
export const SOURCE_TYPES = [
  'Dictionary',
  'Interface Terminology',
  'Indicator Registry',
  'External'
];
export const COLLECTION_TYPES = [
  'Dictionary',
  'Interface Terminology',
  'Indicator Registry',
  'Value Set',
  'Subset',
];
export const HIERARCHY_MEANINGS = [
  'grouped-by',
  'is-a',
  'part-of',
  'classified-with',
];
/*eslint no-useless-escape: 0*/
export const SOURCE_CHILD_URI_REGEX = /\/(orgs|users)\/([a-zA-Z0-9\-\.\_\@]+)\/(sources|collections)\/([a-zA-Z0-9\-\.\_\@]+)\/(concepts|mappings)\/([a-zA-Z0-9\-\.\_\@]+)?\/?([a-zA-Z0-9\-\.\_\@]+)?\/?/;
export const AUTO_ID_NONE = 'None';
export const AUTO_ID_SEQUENTIAL = 'sequential';
export const AUTO_ID_UUID = 'uuid';
export const AUTO_ID_FIELDS = [
  'autoidConceptMnemonic',
  'autoidConceptExternalID',
  'autoidConceptNameExternalID',
  'autoidConceptDescriptionExternalID',
  'autoidMappingMnemonic',
  'autoidMappingExternalID',
];
export const OCL_CLIENT = `oclweb3/${packageJson.version}`;
export const OCL_CLIENT_HEADERS = {
  'X-OCL-CLIENT': OCL_CLIENT,
};
export const OWNER_TYPES = ['orgs', 'users'];
export const REPO_TYPES = ['sources', 'collections'];
export const OCL_SERVERS_GROUP = 'ocl_servers';
export const OCL_FHIR_SERVERS_GROUP = 'ocl_fhir_servers';
export const HAPI_FHIR_SERVERS_GROUP = 'hapi_fhir_servers';
export const OPERATIONS_PANEL_GROUP = 'operations_panel';
export const AUTH_GROUPS = [
  {id: OCL_SERVERS_GROUP, name: 'OCL Servers'},
  {id: OCL_FHIR_SERVERS_GROUP, name: 'OCL FHIR Servers'},
  {id: HAPI_FHIR_SERVERS_GROUP, name: 'HAPI FHIR Servers'},
  {id: OPERATIONS_PANEL_GROUP, name: 'Operations Panel'},
];
export const ROUTE_ID_PATTERN = "[a-zA-Z0-9\-\.\_\@]+";
export const ID_REGEX = /^[a-zA-Z0-9._@-]+$/
export const RESERVED_ROUTE_KEYWORDS = [
  'concepts', 'mappings', 'repos', 'members', 'versions', 'expansions', 'users', 'orgs',
  'references', 'about', 'summary'
]
export const NUM_REGEX = /[0-9.]+/
export const TABLE_LAYOUT_ID = 'table';
export const LIST_LAYOUT_ID = 'list';
export const SPLIT_LAYOUT_ID = 'split';
export const OPENMRS_URL = 'https://openmrs.openconceptlab.org';
export const DEFAULT_FHIR_SERVER_FOR_LOCAL_ID = 6;
export const FHIR_OPERATIONS = ['$validate-code', '$lookup'];
export const UUID_LENGTH = 8+4+4+4+12+4; // last 4 is for 4 hyphens

export const CASCADE_OPTIONS = {
  method: [
    {id: 'sourcetoconcepts', name: 'Mappings & Target Concepts'},
    {id: 'sourcemappings', name: 'Mappings'},
  ],
  view: ['flat', 'hierarchy']
}
export const DEFAULT_CASCADE_PARAMS = {
  method: 'sourcetoconcepts',
  mapTypes: '',
  excludeMapTypes: '',
  returnMapTypes: '*',
  cascadeHierarchy: true,
  cascadeMappings: true,
  includeRetired: false,
  cascadeLevels: '*',
  reverse: false,
  view: 'flat',
  omitIfExistsIn: '',
  equivalencyMapType: '',
}

export const ALL = '*';
export const URL_REGISTRY_DOC_LINK = 'https://docs.openconceptlab.org/en/latest/oclapi/apireference/urlregistry.html'
