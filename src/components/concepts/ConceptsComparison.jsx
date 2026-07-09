import React from 'react'
import { useTranslation } from 'react-i18next'
import { cloneDeep, get, map, isEmpty, sortBy, filter, reject, includes, has, keys, values, orderBy } from 'lodash';
import { Tooltip } from '@mui/material';
import Comparison from '../common/Comparison'
import APIService from '../../services/APIService';
import { toObjectArray, toParentURI, formatDate } from '../../common/utils';
import { useLocation } from 'react-router-dom';

const getLocaleLabelExpanded = (t, locale, formatted=false) => {
  if(!locale)
    return '';

  const primaryLabel = has(locale, 'name') ? t('common.name') : t('common.description');
  const typeValue = get(locale, 'name_type') || get(locale, 'description_type') || '';
  const primaryValue = get(locale, 'name') || get(locale, 'description');
  const preferredText = locale.locale_preferred ? t('common.true') : t('common.false');

  const label = [
    `${primaryLabel}: ${primaryValue}`,
    `Type: ${typeValue}`,
    `Locale: ${locale.locale}`,
    `Preferred: ${preferredText}`,
  ].join('\n')

  if(formatted)
    return (
      <div key={label}>
        <div style={{fontWeight: 700}}>{`${primaryLabel}: ${primaryValue}`}</div>
        <div>{`Type: ${typeValue}`}</div>
        <div>{`Locale: ${locale.locale}`}</div>
        <div>{`Preferred: ${preferredText}`}</div>
      </div>
    );

  return label;
}

const getMappingConceptName = (mapping, rel) => {
  return get(mapping, `${rel}_name`) || get(mapping, `${rel}_name_resolved`) || get(mapping, `${rel}.display_name`)
}

const normalizeText = value => (value || '').trim().toLowerCase();

const getLocalePrimaryValue = locale => get(locale, 'name') || get(locale, 'description') || '';

const getLocaleTypeValue = locale => get(locale, 'name_type') || get(locale, 'description_type') || '';

const getLocaleExactKey = locale => {
  if(!locale)
    return '';

  return [
    normalizeText(getLocalePrimaryValue(locale)),
    normalizeText(locale.locale),
    normalizeText(getLocaleTypeValue(locale)),
    locale.locale_preferred ? '1' : '0'
  ].join('|');
}

const scoreSharedPrefix = (left='', right='') => {
  const max = Math.min(left.length, right.length);
  let count = 0;

  while(count < max && left[count] === right[count])
    count += 1;

  return count;
}

const getLocaleMatchScore = (left, right) => {
  if(!left || !right)
    return -1;

  const leftValue = normalizeText(getLocalePrimaryValue(left));
  const rightValue = normalizeText(getLocalePrimaryValue(right));
  const leftLocale = normalizeText(left.locale);
  const rightLocale = normalizeText(right.locale);
  const leftType = normalizeText(getLocaleTypeValue(left));
  const rightType = normalizeText(getLocaleTypeValue(right));

  let score = 0;
  if(leftLocale && rightLocale && leftLocale === rightLocale)
    score += 100;
  if(leftType && rightType && leftType === rightType)
    score += 40;
  if(left.locale_preferred === right.locale_preferred)
    score += 10;
  if(leftValue && rightValue && leftValue === rightValue)
    score += 120;
  else
    score += scoreSharedPrefix(leftValue, rightValue);

  return score;
}

const getMappingExactKey = mapping => {
  if(!mapping)
    return '';

  return [
    normalizeText(mapping.map_type),
    normalizeText(mapping.from_concept_code),
    normalizeText(mapping.to_concept_url),
    normalizeText(mapping.to_source_url),
    normalizeText(mapping.to_concept_code),
    normalizeText(getMappingConceptName(mapping, 'to_concept')),
  ].join('|');
}

const getMappingMatchScore = (left, right) => {
  if(!left || !right)
    return -1;

  let score = 0;
  if(left.id && right.id && left.id === right.id)
    score += 200;
  if(normalizeText(left.map_type) === normalizeText(right.map_type))
    score += 60;
  if(normalizeText(left.to_source_url) && normalizeText(left.to_source_url) === normalizeText(right.to_source_url))
    score += 80;
  if(normalizeText(left.to_concept_url) && normalizeText(left.to_concept_url) === normalizeText(right.to_concept_url))
    score += 80;
  if(normalizeText(left.to_concept_code) && normalizeText(left.to_concept_code) === normalizeText(right.to_concept_code))
    score += 80;
  if(normalizeText(getMappingConceptName(left, 'to_concept')) === normalizeText(getMappingConceptName(right, 'to_concept')))
    score += 30;

  return score;
}

const alignByBestMatch = (leftItems=[], rightItems=[], {getExactKey, getMatchScore, minScore=0}) => {
  const left = [...leftItems];
  const right = [...rightItems];
  const alignedLeft = [];
  const alignedRight = [];
  const matchedRightIndexes = new Set();

  left.forEach(leftItem => {
    const exactKey = getExactKey ? getExactKey(leftItem) : '';
    if(!exactKey)
      return;

    const rightIndex = right.findIndex((rightItem, index) => !matchedRightIndexes.has(index) && getExactKey(rightItem) === exactKey);
    if(rightIndex >= 0) {
      matchedRightIndexes.add(rightIndex);
      alignedLeft.push(leftItem);
      alignedRight.push(right[rightIndex]);
    }
  });

  left.forEach(leftItem => {
    if(alignedLeft.includes(leftItem))
      return;

    let bestIndex = -1;
    let bestScore = minScore - 1;

    right.forEach((rightItem, index) => {
      if(matchedRightIndexes.has(index))
        return;

      const score = getMatchScore ? getMatchScore(leftItem, rightItem) : -1;
      if(score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if(bestIndex >= 0 && bestScore >= minScore) {
      matchedRightIndexes.add(bestIndex);
      alignedLeft.push(leftItem);
      alignedRight.push(right[bestIndex]);
    } else {
      alignedLeft.push(leftItem);
      alignedRight.push(null);
    }
  });

  right.forEach((rightItem, index) => {
    if(matchedRightIndexes.has(index))
      return;

    alignedLeft.push(null);
    alignedRight.push(rightItem);
  });

  return {lhs: alignedLeft, rhs: alignedRight};
}

const getMappingTargetSourceLabel = mapping => {
  return mapping.to_source_name || mapping.to_source || mapping.to_source_url || '';
}

const formatInlineMappingSide = (sourceLabel, conceptCode, conceptName) => {
  const base = [sourceLabel, conceptCode].filter(Boolean).join(': ');
  return conceptName ? `${base} "${conceptName}"` : base;
}

const getMappingDisplayLabel = mapping => {
  const fromSource = mapping.source;
  const fromCode = mapping.from_concept_code || '';
  const fromName = getMappingConceptName(mapping, 'from_concept');
  const toSource = getMappingTargetSourceLabel(mapping);
  const toCode = mapping.to_concept_code || mapping.to_concept_url || '';
  const toName = getMappingConceptName(mapping, 'to_concept');

  return `${formatInlineMappingSide(fromSource, fromCode, fromName)} [${mapping.map_type}] ${formatInlineMappingSide(toSource, toCode, toName)}`;
}

const getMappingLabel = (t, mapping, formatted=false) => {
  if(!mapping)
    return '';

  const label = getMappingDisplayLabel(mapping);

  if(formatted)
    return (
      <div key={label}>
        <Tooltip arrow placement='top-start' title={mapping.to_source_url || ''}>
          <div style={{whiteSpace: 'break-spaces'}}>{label}</div>
        </Tooltip>
      </div>
    );

  return label
}

const ConceptsComparison = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const attributeState = {show: true, type: 'text'}
  const attributes = {
    concept_class: {...cloneDeep(attributeState), position: 1},
    datatype: {...cloneDeep(attributeState), position: 1},
    display_locale: {...cloneDeep(attributeState), position: 2},
    external_id: {...cloneDeep(attributeState), position: 3},
    owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 4},
    names: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 5, expandOnDiff: true},
    descriptions: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 6, expandOnDiff: true},
    mappings: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 7, expandOnDiff: true},
    extras: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 8, expandOnDiff: true},
    retired: {...cloneDeep(attributeState), type: 'bool', position: 9},
    parent_concept_urls: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 14, expandOnDiff: true},
    child_concept_urls: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 15, expandOnDiff: true},
    metadata: {
      ...cloneDeep(attributeState),
      type: 'group',
      label: t('common.metadata'),
      collapsed: true,
      position: 99,
      children: [
        {attr: 'created_by', type: 'text'},
        {attr: 'updated_by', type: 'text'},
        {attr: 'created_on', type: 'date'},
        {attr: 'updated_on', type: 'date'},
        {attr: 'checksums.standard', type: 'text', label: 'Checksums Standard'},
        {attr: 'checksums.smart', type: 'text', label: 'Checksums Smart'},
      ]
    },
  }

  const fetcher = (uri, attr, loadingAttr, state, callback) => {
    if(uri && attr && loadingAttr) {
      const { isVersion } = state;
      const isAnyVersion = isVersion || uri.match(/\//g).length === 8;
      return APIService
        .new()
        .overrideURL(encodeURI(uri))
        .get(null, null, {includeInverseMappings: true, includeHierarchyPath: true, includeParentConceptURLs: true, includeChildConceptURLs: true})
        .then(response => {
          if(get(response, 'status') === 200) {
            const newState = {...state}
            newState[attr] = formatter(response.data)
            newState[loadingAttr] = false
            newState.isVersion = isAnyVersion
            newState.attributes = attributes
            if(isAnyVersion) {
              newState.attributes['is_latest_version'] = {...cloneDeep(attributeState), type: 'bool', position: 16}
              newState.attributes['update_comment'] = {...cloneDeep(attributeState), position: 17}
            }
            if(callback)
              callback(newState)
            return newState
          }
        })
    }
  }

  const formatter = (concept) => {
    concept.names = sortLocales(concept.names)
    concept.descriptions = sortLocales(concept.descriptions)
    concept.originalExtras = concept.extras
    concept.extras = toObjectArray(concept.extras)
    return concept
  }

  const sortLocales = locales => {
    return sortBy([
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: true}),
      ...filter(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: false}),
      ...reject(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
    ], 'locale')
  }

  const formatData = state => {
    const newState = {...state};
    const sortedLhsNames = !isEmpty(get(state.lhs, 'names'))
      ? orderBy(newState.lhs.names, ['name_type', 'name'], ['asc', 'asc'])
      : [];
    const sortedRhsNames = !isEmpty(get(state.rhs, 'names'))
      ? orderBy(newState.rhs.names, ['name_type', 'name'], ['asc', 'asc'])
      : [];
    const sortedLhsDescriptions = !isEmpty(get(state.lhs, 'descriptions'))
      ? orderBy(newState.lhs.descriptions, ['description_type', 'description'], ['asc', 'asc'])
      : [];
    const sortedRhsDescriptions = !isEmpty(get(state.rhs, 'descriptions'))
      ? orderBy(newState.rhs.descriptions, ['description_type', 'description'], ['asc', 'asc'])
      : [];

    const alignedNames = alignByBestMatch(sortedLhsNames, sortedRhsNames, {
      getExactKey: getLocaleExactKey,
      getMatchScore: getLocaleMatchScore,
      minScore: 100,
    });
    const alignedDescriptions = alignByBestMatch(sortedLhsDescriptions, sortedRhsDescriptions, {
      getExactKey: getLocaleExactKey,
      getMatchScore: getLocaleMatchScore,
      minScore: 100,
    });
    const alignedMappings = alignByBestMatch(newState.lhs.mappings || [], newState.rhs.mappings || [], {
      getExactKey: getMappingExactKey,
      getMatchScore: getMappingMatchScore,
      minScore: 80,
    });

    newState.lhs.names = alignedNames.lhs
    newState.rhs.names = alignedNames.rhs
    newState.lhs.descriptions = alignedDescriptions.lhs
    newState.rhs.descriptions = alignedDescriptions.rhs
    newState.lhs.mappings = alignedMappings.lhs
    newState.rhs.mappings = alignedMappings.rhs

    return newState
  }

  const getHeaderSubAttributeValues = (concept, isVersion) => {
    const attributes = [
      {
        name: `${t('repo.source')}:`,
        value: concept.source,
        url: toParentURI(concept.url)
      },
      {
        name: `${t('common.uid')}:`,
        value: concept.id,
        url: null
      },
    ]
    if (isVersion) {
      attributes.push({
        name: `${t('common.version')}:`,
        value: concept.version,
        url: null
      })
      attributes.push({
        name: `${t('common.created_on')}:`,
        value: getAttributeValue(concept, 'created_on', 'date'),
        url: null
      })
    }

    return attributes
  }

  const getAttributeValue = (concept, attr, type, formatted=false) => {
    let value = get(concept, attr)
    if (attr === 'extras')
      return JSON.stringify(value, undefined, 2)
    if(type === 'list') {
      if(isEmpty(value)) return '';
      if(includes(['names', 'descriptions'], attr))
        return map(value, locale => getLocaleLabelExpanded(t, locale, formatted))
      if (attr === 'mappings')
        return map(value, mapping => getMappingLabel(t, mapping, formatted));
      else
        return value
    } else if(type === 'date') {
      if(attr === 'created_on')
        value ||= get(concept, 'created_at')
      if(attr === 'updated_on')
        value ||= get(concept, 'updated_at')
      return value ? formatDate(value) : '';
    } else if (type === 'textFormatted') {
      if(attr === 'owner')
        return `${concept.owner_type}: ${concept.owner}`
    } else if (type === 'bool') {
      return value ? t('common.true') : t('common.false')
    } else {
      if(includes(['created_by', 'updated_by'], attr))
        value ||= get(concept, `version_${attr}`)
      if(attr === 'updated_by' && has(concept, 'version_created_by'))
        value ||= concept.version_created_by
      return value || '';
    }
  }

  const getExtraAttributeLabel = (val) => {
    if(!val)
      return ''
    return `${keys(val)[0]}: ${JSON.stringify(values(val)[0])}`
  }

  const getListAttributeValue = (attr, val, formatted=false) => {
    if(includes(['names', 'descriptions'], attr))
      return getLocaleLabelExpanded(t, val, formatted)
    if(includes(['mappings'], attr))
      return getMappingLabel(t, val, formatted)
    if(includes(['extras'], attr))
      return getExtraAttributeLabel(val)
    if(includes(['parent_concept_urls', 'child_concept_urls'], attr))
      return val
  }

  return <Comparison
           fetcher={fetcher}
           search={location.search}
           postFetch={formatData}
           getHeaderSubAttributeValues={getHeaderSubAttributeValues}
           getAttributeValue={getAttributeValue}
           getListAttributeValue={getListAttributeValue}
  />
}


export default ConceptsComparison
