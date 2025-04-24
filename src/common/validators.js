import {has, forEach, isEmpty, isNumber} from "lodash";

export const MESSAGES = {
  REQUIRED: 'This field can not be blank',
  SELECTED: 'Please select from suggestions',
  PATTERN: 'Invalid value'
};

export const VALUE_NOT_SELECTED = 'VALUE_NOT_SELECTED';

export const  required = (msg='') => getValidator(
  value => isEmpty(value) && !isNumber(value),
  (msg) ? msg : MESSAGES.REQUIRED,
);

export const selected = (msg='') => getValidator(
  value => ('' + value).length && value === VALUE_NOT_SELECTED,
  (msg) ? msg : MESSAGES.SELECTED,
);

export const matchPattern = (pattern, msg='') => getValidator(
  value => value?.length && !value.match(pattern)?.length,
  (msg) ? msg : MESSAGES.PATTERN,
);


export const applyValidatorsOn = fields => {
  forEach(fields, (field) => {
    if(has(field, 'value') && has(field, 'validators')){
      field.errors = [];
      field.validators.forEach((validator) => {
        if(validator.isInvalid(field.value)) {
          field.errors.push(validator.message);
        }
      });
    }
  });
};

const getValidator = (isInvalidFunction, message, type='error') => {
  return {
    isInvalid: isInvalidFunction,
    message,
    type,
  };
}
