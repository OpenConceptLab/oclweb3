import React from 'react';
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { set, forEach, get, isArray, isObject, mapValues, map, fromPairs } from 'lodash'
import {
  required,
} from '../../common/validators';


export const CardSection = ({title, sx, children}) => {
  return (
    <Card variant="outlined" sx={{p: 2, marginTop: '8px', ...(sx || {})}}>
      <Typography sx={{fontWeight: 'bold', color: 'surface.contrastText' }}>
        {title}
      </Typography>
      <React.Fragment>
        {children}
      </React.Fragment>
    </Card>
  )
}


class FormComponent extends React.Component {
  getFieldStruct = (defaultValue, validators, errors) => {
    return {
      value: defaultValue === undefined ? '' : defaultValue,
      validators: validators || [],
      errors: errors || []
    }
  }

  getMandatoryFieldStruct = (defaultValue, validators, errors) => {
    return this.getFieldStruct(defaultValue, [required(), ...(validators || [])], errors)
  }

  setFieldValue = (key, value) => {
    this.setState(
      state => set(state, `fields.${key}.value`, value), () => this.setFieldErrors(key)
    );
  }

  setExtrasValue = (index, key, value) => {
    this.setState(
      state => set(state, `fields.extras.${index}.${key}`, value)
    );
  }

  getFieldErrors = key => {
    const errors = [];
    const value = get(this.state.fields, `${key}.value`);
    const validators = get(this.state.fields, `${key}.validators`) || [];

    validators.forEach((validator) => {
      if (validator.isInvalid(value)) {
        errors.push(validator.message);
      }
    });

    return errors;
  }

  setFieldErrors = key => {
    const newState = {...this.state}
    set(newState.fields, `${key}.errors`, this.getFieldErrors(key))
    this.setState(newState)
  }

  setAllFieldsErrors = () => {
    const newState = { ...this.state };
    let isValid = true

    forEach(newState.fields, (value, key) => {
      if(value?.validators?.length > 0) {
        let errors = this.getFieldErrors(key)
        if(isValid)
          isValid = !errors?.length
        set(newState.fields, `${key}.errors`, errors)
      }
      else if(isArray(value)) {
        forEach(value, (val, index) => {
          if(isObject(val)) {
            forEach(val, (v, k) => {
              if(v?.validators?.length > 0) {
                let _errors = this.getFieldErrors(`${key}.${index}.${k}`)
                if(isValid)
                  isValid = !_errors.length
                set(newState.fields, `${key}.${index}.${k}.errors`, _errors)
              }
            })
          }
        })
      }
    })
    this.setState(newState);
    return isValid
  }

  getValues = () => {
    return mapValues(this.state.fields, (field, key) => {
      if(key === 'extras'){
        return fromPairs(field.filter(ex => ex?.key).map(({ key, value }) => [key, value]))
      }
      if(isArray(field) && isObject(get(field, 0))) {
        return map(field, f => mapValues(f, 'value'))
      }
      return field.value
    })
  }

  render() {
    return (<div style={{display: 'none'}} />)
  }

}

export default FormComponent;
