import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import Button from './Button';


const AddButton = props => (
  <Button icon={<AddIcon fontSize='inherit'/>} {...props} />
)

export default AddButton;
