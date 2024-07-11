import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse';
import Link from './Link'

const About = ({ title, text }) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = React.useState(false)

  const shouldShowReadMore = () => {
    if(!showAll && text) {
      const el = document.getElementById('about-text')
      if(el && el?.clientHeight)
        return el.clientHeight > 70
    }
    return true
  }

  return text ? (
    <div className='col-xs-12 padding-0' style={{marginTop: '16px'}}>
      <Typography component='h2' sx={{color: '#000', fontWeight: 'bold'}}>
        {title}
      </Typography>
      <div id='hidden-about' className='col-xs-12 padding-0 hidden' style={{display: 'none !important'}} dangerouslySetInnerHTML={{__html: text.replaceAll('href="/', 'href="/#/')}} />
      <Collapse in={showAll} collapsedSize={75}>
        <div id='about-text' className='col-xs-12 padding-0 md-content' dangerouslySetInnerHTML={{__html: text.replaceAll('href="/', 'href="/#/')}} />
      </Collapse>
      {
        shouldShowReadMore() &&
          <Link onClick={() => setShowAll(!showAll)} sx={{fontSize: '12px', marginTop: '8px'}} color='primary' label={showAll ? t('common.read_less') : t('common.read_more')} />
      }
    </div>
  ) : null
}

export default About;
