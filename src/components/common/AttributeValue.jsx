import React from 'react';
import isBoolean from 'lodash/isBoolean'
import isObject from 'lodash/isObject'

// A property or custom attribute value can be any JSON; a list or object shows as indented JSON, since React can't
// render it as a child
const AttributeValue = ({ value }) => {
  if(isObject(value))
    return <pre style={{margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{JSON.stringify(value, undefined, 2)}</pre>
  return isBoolean(value) ? value.toString() : value
}

export default AttributeValue
