import React from 'react';
import find from 'lodash/find'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import {
  formatDate,
  formatWebsiteLink,
} from '../../common/utils';
import Retired from '../common/Retired';
import OwnerIcon from '../common/OwnerIcon';
import RepoVersionButton from '../repos/RepoVersionButton';
import RepoChip from '../repos/RepoChip';
import FromAndTargetSource from '../mappings/FromAndTargetSource'
import ConceptCell from '../mappings/ConceptCell'
import ReferenceChip from '../common/ReferenceChip';
import ReferenceTypeChips from '../common/ReferenceTypeChips'


const getLocale = (concept, synonym) => {
  let cleaned = synonym.replaceAll('<em>', '').replaceAll('</em>', '')
  let locale = find(concept?.names, name => name?.name.toLowerCase() === cleaned.toLowerCase())

  return <div>{locale?.locale ? `[${locale.locale}] ${[locale.name]}` : cleaned}</div>
}

const getReferenceSummary = (reference) => {
  let label = '';
  if(reference.last_resolved_at && reference.concepts === 0 && reference.mappings === 0) {
    if(reference.reference_type === 'mappings')
      return '0 mappings'
    if(reference.reference_type === 'concepts')
      return '0 concepts'
    return '0 concepts, 0 mappings'
  }
  if(isNumber(reference.concepts) && reference.concepts > 0)
    label += `${reference.concepts.toLocaleString()} concepts`
  if(isNumber(reference.mappings) && reference.mappings > 0) {
    if(label?.length)
      label += ', '
    label += `${reference.mappings.toLocaleString()} mappings`
  }

  return label
}


export const ALL_COLUMNS = {
  concepts: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: 'id_lowercase', className: 'searchable', permanent: true},
    {id: 'name', labelKey: 'concept.display_name', value: 'display_name', sortOn: '_name', className: 'searchable', sortBy: 'asc', permanent: true, renderer: item => (
      <span>
        <React.Fragment>
          {item.retired && <Retired style={{marginRight: '8px'}}/>} {item.display_name}
          {
            item.search_meta?.search_highlight?.synonyms?.length && item?.names?.length &&
              <div style={{marginTop: '6px', color: 'rgba(0, 0, 0, 0.5)', fontSize: '12px'}}>
                {
                  item.search_meta?.search_highlight?.synonyms.map(syn => <React.Fragment key={syn}>{getLocale(item, syn)}</React.Fragment>)
                }
              </div>
          }
        </React.Fragment>
      </span>
    )
    },
    {id: 'concept_class', labelKey: 'concept.concept_class', value: 'concept_class', sortOn: 'concept_class', className: 'searchable', sx: {whiteSpace: 'pre'}, property: true},
    {id: 'datatype', labelKey: 'concept.datatype', value: 'datatype', sortOn: 'datatype', className: 'searchable', property: true},
    {id: 'owner', labelKey: 'common.owner', value: 'owner', sortOn: 'owner', nested: false, renderer: item => (<span style={{display: 'flex', whiteSpace: 'nowrap'}}><OwnerIcon noTooltip ownerType={item.owner_type} fontSize='small' sx={{marginRight: '4px'}}/>{item.owner}</span>)},
    {id: 'parent', labelKey: 'repo.repo', value: 'source', sortOn: 'source', nested: false, renderer: item => <RepoVersionButton repoType='Source' repo={item.source} version={item.latest_source_version} vertical />},
  ],
  mappings: [
    {id: 'fromAndTargetSource', labelKey: 'mapping.fromAndTargetSource', sortable: false, className: 'searchable', renderer: item => <FromAndTargetSource mapping={item} />},
    {id: 'fromConcept', labelKey: 'mapping.fromConcept', value: 'fromConceptCode', className: 'searchable', sortable: false, renderer: item => <ConceptCell mapping={item} direction='from' />},
    {id: 'mapType', labelKey: 'mapping.map_type', value: 'map_type', sortable: true},
    {id: 'toConcept', labelKey: 'mapping.toConcept', value: 'toConceptCode', className: 'searchable', sortable: false, renderer: item => <ConceptCell mapping={item} direction='to' />},
  ],
  references: [
    {
      id: 'expression',
      labelKey: 'reference.expression',
      value: 'expression',
      sortable: false,
      translation: true,
      renderer: (reference, translation) => <ReferenceChip {...reference} showTranslation={translation} />
    },
    {id: 'ref_types', labelKey: 'reference.reference_type', value: 'ref_type', sortable: false, renderer: (reference) => <ReferenceTypeChips reference={reference} />},
    {id: 'resolved_repo_versions', labelKey: 'reference.resolved_repo', value: 'resolved_repo_versions', sortable: false, renderer: (reference) => {
      return map(reference?.resolved_repo_versions, (version, index) => {
        return <RepoChip hideType size='small' key={index} repo={version} sx={{margin: '2px'}} />
      })
    }},
    {id: 'summary', labelKey: 'common.results', value: 'summary', sortable: false, renderer: reference => reference.last_resolved_at ? getReferenceSummary(reference) : '-'},
  ],
  repos: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: 'id', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: 'name', className: 'searchable'},
    {id: 'type', labelKey: 'repo.repo_type', value: 'repo_type', sortable: false},
    {id: 'owner', labelKey: 'common.owner', value: 'owner', sortOn: 'owner', renderer: item => (<span style={{display: 'flex', alignItems: 'center'}}><OwnerIcon noTooltip ownerType={item.owner_type} fontSize='small' sx={{marginRight: '4px'}}/>{item.owner}</span>)}
  ],
  orgs: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: '_mnemonic', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: '_name', className: 'searchable'},
    {id: 'company', labelKey: 'common.company', value: 'company', className: 'searchable'},
    {id: 'location', labelKey: 'common.location', value: 'location', className: 'searchable'},
    {id: 'created_on', labelKey: 'common.created_on', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
  ],
  users: [
    {id: 'username', labelKey: 'user.username', value: 'username', sortOn: '_username', sortBy: 'asc', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'email', labelKey: 'user.email', value: 'email', sortable: false},
    {id: 'company', labelKey: 'user.company', value: 'company'},
    {id: 'location', labelKey: 'user.location', value: 'location'},
    {id: 'website', labelKey: 'common.website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'date_joined', labelKey: 'user.joined_on', value: 'date_joined', formatter: formatDate, sortOn: 'date_joined'},
  ],
  url_registry: [
    {id: 'url', labelKey: 'url_registry.canonical_url', value: 'url', className: 'searchable'},
    {id: 'target_owner', labelKey: 'url_registry.target_owner', value: 'repo.owner_url', className: 'searchable'},
    {id: 'repo_id', labelKey: 'repo.repo_id', value: 'repo.id', className: 'searchable'},
    {id: 'repo_type', labelKey: 'repo.repo_type', value: 'repo.type', className: 'searchable'},
  ]
};


export const HIGHLIGHT_ICON_WHITELISTED_FILEDS = {
  concepts: ['external_id', 'same_as_map_codes', 'other_map_codes'],
  mappings: ['external_id'],
  sources: ['external_id'],
  collections: ['external_id'],
  organizations: ['external_id'],
  users: ['external_id'],
}

export const FACET_ORDER = {
  mappings: [
    'owner', 'ownerType', 'source', 'mapType',
    'fromConceptOwner', 'fromConceptOwnerType', 'fromConceptSource', 'fromConcept',
    'toConceptOwner', 'toConceptOwnerType', 'toConceptSource', 'toConcept',
    'retired', 'collection_membership', 'updatedBy'
  ],
  "repos": ["repoType", "sourceType", "collectionType", "owner", "ownerType", "customValidationSchema", "locale", "retired"]
}

export const SORT_ATTRS = {
  global: {
    concepts: ['score', 'ID', 'name', 'concept_class', 'datatype', 'source', 'owner'],
    mappings: ['score', 'ID', 'map_type', 'source', 'owner'],
  },
  nested: {
    concepts: ['score', 'last_update', 'ID', 'numeric_id', '_name', 'concept_class', 'datatype'],
    mappings: ['score', 'last_update', 'ID', 'map_type'],
  },
  common: {
    users: ['score', 'username', 'date_joined', 'company', 'location'],
    orgs: ['score', 'last_update', 'name', 'ID'],
    repos: ['score', 'last_update', 'ID', 'name', 'owner', 'canonical_url'],
  },
}
