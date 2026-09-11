import React from 'react';
import Error401 from './Error401';
import Error403 from './Error403';
import Error404 from './Error404';

const Error40X = ({ status, nested, message }) => {
  if(status === 401)
    return <Error401 nested={nested} message={message} />
  if(status === 403)
    return <Error403 nested={nested} message={message} />
  if(status === 404)
    return <Error404 nested={nested} message={message} />

  return null
}

export default Error40X;
