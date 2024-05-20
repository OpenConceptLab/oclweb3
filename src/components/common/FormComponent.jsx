import React from 'react';
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { set, forEach } from 'lodash'
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
      state => set(state, `fields.${key}.value`, value)
    );
  }

  setExtrasValue = (index, key, value) => {
    this.setState(
      state => set(state, `fields.extras.${index}.${key}`, value)
    );
  }

  getFieldErrors = key => {
    const errors = [];
    const value = this.state.fields[key].value;
    const validators = this.state.fields[key].validators || [];

    validators.forEach((validator) => {
      if (validator.isInvalid(value)) {
        errors.push(validator.message);
      }
    });

    return errors;
  }

  setFieldErrors = key => {
    this.setState(state => ({
      ...state,
      fields: {
        ...state.fields,
        [key]: {
          ...state.fields[key],
          errors: this.getFieldErrors(key)
        }
      }
    }));
  }

  setAllFieldsErrors = () => {
    const newState = { ...this.state };

    forEach(newState.fields, (value, key) => {
      newState.fields[key].errors = this.getFieldErrors(key);
    });
    this.setState(newState);
  }

  render() {
    return (<div style={{display: 'none'}} />)
  }

}

export default FormComponent;
