import React from 'react';
import Error401 from './Error401';
import Error403 from './Error403';
import Error404 from './Error404';

const Error40X = ({ status }) => {
  if(status === 401)
    return <Error401 />
  if(status === 403)
    return <Error403 />
  if(status === 404)
    return <Error404 />

  return null
}

export default Error40X;
