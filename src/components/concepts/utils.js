import {orderBy, map } from 'lodash';

import APIService from '../../services/APIService';
import { handleLookupValuesResponse } from '../../common/utils'

export const fetchLocales = (callback, includeRawName=false) => {
  APIService.locales().get(null, null, {verbose: true}).then(response => {
    const mapper = locale => {
      let data = {id: locale.id, name: locale.display_name, uuid: locale.uuid, locale: locale.locale}
      if(includeRawName) {
        data.name = locale.display_name
        data.displayName = locale.display_name
      }
      return data
    }
    callback(orderBy(map(response.data, mapper), 'displayName'));
  });
}

export const fetchConceptClasses = callback => {
  APIService.orgs('OCL').sources('Classes').appendToUrl('concepts/lookup/')
    .get()
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchDatatypes = callback => {
  APIService.orgs('OCL').sources('Datatypes').appendToUrl('concepts/lookup/')
    .get()
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchNameTypes = callback => {
  APIService.orgs('OCL').sources('NameTypes').appendToUrl('concepts/lookup/')
    .get()
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchDescriptionTypes = callback => {
  APIService.orgs('OCL').sources('DescriptionTypes').appendToUrl('concepts/lookup/')
    .get()
    .then(response => handleLookupValuesResponse(response.data, callback));
}
