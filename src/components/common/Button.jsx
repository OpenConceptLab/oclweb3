import React from 'react';

import Chip from '@mui/material/Chip';
import merge from 'lodash/merge';


const Button = ({style, sx, ...rest}) => (
  <Chip style={merge({height: '40px', borderRadius: '100px', padding: '0 8px'}, (style || sx || {}))} {...rest} />
)

export default Button;
