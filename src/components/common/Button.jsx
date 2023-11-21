import React from 'react';

import Chip from '@mui/material/Chip';
import merge from 'lodash/merge';


const Button = ({style, ...rest}) => (
  <Chip style={merge({height: '40px', borderRadius: '100px', padding: '0 8px'}, (style || {}))} {...rest} />
)

export default Button;
