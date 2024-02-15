import React from 'react';
import Typography from '@mui/material/Typography'

const About = ({ title, text }) => {
  return text ? (
    <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
      <Typography component='h2' sx={{color: '#000', fontWeight: 'bold'}}>
        {title}
      </Typography>
      <div className='col-xs-12 padding-0' dangerouslySetInnerHTML={{__html: text.replaceAll('href="/', 'href="/#/')}} />
    </div>
  ) : null
}

export default About;
