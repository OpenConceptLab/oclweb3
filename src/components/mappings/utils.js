import APIService from '../../services/APIService';

import { handleLookupValuesResponse } from '../../common/utils'

export const fetchMapTypes = callback => {
  APIService.orgs('OCL').sources('MapTypes').appendToUrl('concepts/lookup/')
    .get()
    .then(response => handleLookupValuesResponse(response.data, callback));
}

