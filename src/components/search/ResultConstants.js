import React from 'react';
import {
  formatDate
} from '../../common/utils';
import OwnerIcon from '../common/OwnerIcon';


export const ALL_COLUMNS = {
  concepts: [
    {id: 'id', labelKey: 'concept.id', value: 'id', sortOn: 'id_lowercase', className: 'searchable'},
    {id: 'name', labelKey: 'concept.display_name', value: 'display_name', sortOn: '_name', className: 'searchable', sortBy: 'asc'},
    {id: 'class', labelKey: 'concept.concept_class', value: 'concept_class', sortOn: 'concept_class'},
    {id: 'datatype', labelKey: 'concept.datatype', value: 'datatype', sortOn: 'datatype'},
    {id: 'updatedOn', labelKey: 'common.updated_on', value: 'version_updated_on', formatter: formatDate, sortOn: 'last_update', global: false},
    {id: 'updatedBy', labelKey: 'common.updated_by', value: 'version_updated_by', global: false},
    {id: 'parent', labelKey: 'repo.repo', value: 'source', sortOn: 'source', nested: false, renderer: item => `${item.source}:${item.latest_source_version}`},
    {id: 'owner', labelKey: 'common.owner', value: 'owner', sortOn: 'owner', nested: false, renderer: item => (<span style={{display: 'flex'}}><OwnerIcon ownerType={item.owner_type} fontSize='small' style={{marginRight: '4px'}}/>{item.owner}</span>)},
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
  concepts: ['owner', 'ownerType', 'source', 'conceptClass', 'datatype', 'locale', 'retired', 'collection_membership', 'nameTypes', 'descriptionTypes', 'updatedBy'],
  mappings: [
    'owner', 'ownerType', 'source', 'mapType',
    'fromConceptOwner', 'fromConceptOwnerType', 'fromConceptSource', 'fromConcept',
    'toConceptOwner', 'toConceptOwnerType', 'toConceptSource', 'toConcept',
    'retired', 'collection_membership', 'updatedBy'
  ]
}

export const SORT_ATTRS = {
  concepts: ['score', 'last_update', 'id', 'numeric_id', '_name', 'concept_class', 'datatype', 'source', 'owner'],
  mappings: ['score', 'last_update', 'id', 'map_type', 'source', 'owner'],
  users: ['score', 'username', 'date_joined', 'company', 'location'],
  organizations: ['score', 'last_update', 'name', 'mnemonic'],
  sources: ['score', 'last_update', 'mnemonic', 'source_type', 'name', 'owner', 'canonical_url'],
  collections: ['score', 'last_update', 'mnemonic', 'collection_type', 'name', 'owner', 'canonical_url'],
}
