import React from 'react';
import {
  formatDate,
  formatWebsiteLink,
} from '../../common/utils';
import OwnerIcon from '../common/OwnerIcon';
import Retired from '../common/Retired';
import RepoVersionLabel from '../repos/RepoVersionLabel';
import FromConcept from '../concepts/FromConcept';
import ToConcept from '../concepts/ToConcept';


export const ALL_COLUMNS = {
  concepts: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: 'id_lowercase', className: 'searchable'},
    {id: 'name', labelKey: 'concept.display_name', value: 'display_name', sortOn: '_name', className: 'searchable', sortBy: 'asc', renderer: item => (<span><React.Fragment>{item.retired && <Retired style={{marginRight: '8px'}}/>} {item.display_name}</React.Fragment></span>)},
    {id: 'concept_class', labelKey: 'concept.concept_class', value: 'concept_class', sortOn: 'concept_class'},
    {id: 'datatype', labelKey: 'concept.datatype', value: 'datatype', sortOn: 'datatype'},
    {id: 'updatedOn', labelKey: 'common.updated_on', value: 'version_updated_on', formatter: formatDate, sortOn: 'last_update', global: false},
    {id: 'updatedBy', labelKey: 'common.updated_by', value: 'version_updated_by', global: false},
    {id: 'parent', labelKey: 'repo.repo', value: 'source', sortOn: 'source', nested: false, renderer: (item, isSplitView) => <RepoVersionLabel repo={item.source} version={item.latest_source_version} vertical={isSplitView} />},
    {id: 'owner', labelKey: 'common.owner', value: 'owner', sortOn: 'owner', nested: false, renderer: item => (<span style={{display: 'flex'}}><OwnerIcon ownerType={item.owner_type} fontSize='small' style={{marginRight: '4px'}}/>{item.owner}</span>)},
  ],
  mappings: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: 'id_lowercase', className: 'searchable'},
    {id: 'fromConcept', labelKey: 'mapping.fromConcept', value: 'fromConceptCode', className: 'searchable', sortable: false, renderer: item => <FromConcept mapping={item} />},
    {id: 'mapType', labelKey: 'mapping.type', value: 'map_type', sortable: true},
    {id: 'toConcept', labelKey: 'mapping.toConcept', value: 'toConceptCode', className: 'searchable', sortable: false, renderer: item => <ToConcept mapping={item} />},
  ],
  repos: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: 'id', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: 'name', className: 'searchable'},
    {id: 'type', labelKey: 'repo.repo_type', value: 'type'},
    {id: 'owner', labelKey: 'common.owner', value: 'owner', sortOn: 'owner', renderer: item => (<span style={{display: 'flex'}}><OwnerIcon ownerType={item.owner_type} fontSize='small' style={{marginRight: '4px'}}/>{item.owner}</span>)},
  ],
  orgs: [
    {id: 'id', labelKey: 'common.id', value: 'id', sortOn: '_mnemonic', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'createdOn', labelKey: 'common.created_on', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
  ],
  users: [
    {id: 'username', labelKey: 'user.username', value: 'username', sortOn: '_username', sortBy: 'asc', className: 'searchable'},
    {id: 'name', labelKey: 'common.name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'email', labelKey: 'user.email', value: 'email', sortable: false},
    {id: 'company', labelKey: 'user.company', value: 'company'},
    {id: 'location', labelKey: 'user.location', value: 'location'},
    {id: 'website', labelKey: 'user.website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'date_joined', labelKey: 'user.joined_on', value: 'date_joined', formatter: formatDate, sortOn: 'date_joined'},
  ],
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
  concepts: ['conceptClass', 'source', 'datatype', 'owner', 'locale', 'nameTypes', 'ownerType', 'descriptionTypes', 'retired', 'collection_membership', 'updatedBy'],
  mappings: [
    'owner', 'ownerType', 'source', 'mapType',
    'fromConceptOwner', 'fromConceptOwnerType', 'fromConceptSource', 'fromConcept',
    'toConceptOwner', 'toConceptOwnerType', 'toConceptSource', 'toConcept',
    'retired', 'collection_membership', 'updatedBy'
  ],
  "repos": ["sourceType", "collectionType", "owner", "ownerType", "customValidationSchema", "locale"]
}

export const SORT_ATTRS = {
  global: {
    concepts: ['score', 'id', 'name', 'concept_class', 'datatype', 'source', 'owner'],
    mappings: ['score', 'id', 'map_type', 'source', 'owner'],
  },
  nested: {
    concepts: ['score', 'last_update', 'id', 'numeric_id', '_name', 'concept_class', 'datatype'],
    mappings: ['score', 'last_update', 'id', 'map_type'],
  },
  common: {
    users: ['score', 'username', 'date_joined', 'company', 'location'],
    orgs: ['score', 'last_update', 'name', 'mnemonic'],
    repos: ['score', 'last_update', 'mnemonic', 'name', 'owner', 'canonical_url'],
  },
}
