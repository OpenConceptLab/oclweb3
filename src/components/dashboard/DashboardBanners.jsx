import React from 'react';
import { useTranslation } from 'react-i18next'
import { WHITE } from '../../common/colors'
import Carousel from 'react-material-ui-carousel'
import { Chip } from '@mui/material'
import CategoryIcon from '@mui/icons-material/Category';
import WorkIcon from '@mui/icons-material/Workspaces';
import SquareIcon from '@mui/icons-material/Dashboard';
import ConceptIcon from '../concepts/ConceptIcon'

const Item = props => {
  const { t } = useTranslation()
  return (
    <div style={{width: '100%', margin: '0 auto'}}>
      <p style={{fontSize: '16px', margin: 0}}>{props.item.name}</p>
      <p style={{fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0}}>{props.item.description}</p>
      <div className='col-xs-12 padding-0'>
        <div className='col-xs-12 padding-0'>
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
          <WorkIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <SquareIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <CategoryIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
          <WorkIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
    </div>
        <div className='col-xs-12 padding-0'>
          <WorkIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
          <CategoryIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <SquareIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <WorkIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
        </div>
        <div className='col-xs-12 padding-0'>
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
          <SquareIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <WorkIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <CategoryIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
          <ConceptIcon selected sx={{color: WHITE, width: '50px', height: '50px'}} />
          <SquareIcon sx={{color: WHITE, width: '50px', height: '50px'}} />
        </div>
    </div>
      <div className='col-xs-12 padding-0' style={{textAlign: 'center', marginTop: '16px'}}>
        <Chip sx={{minHeight: '40px', fontSize: '14px', fontWeight: '500', backgroundColor: 'primary.dark', color: 'primary.20', width: '100%', borderRadius: '100px'}} label={t('dashboard.take_a_tour')} onClick={() => {}}/>
    </div>
    </div>
  )
}

const DashboardBanners = () => {
  const items = [
    {
      name: "We've made a few changes...",
      description: "open concept lab"
    },
    {
      name: "We've made a few changes2...",
      description: "open concept lab"
    },
  ]

  return (
    <div className='col-xs-12 padding-0 flex-vertical-center' style={{height: '370px', borderRadius: '10px'}}>
      <Carousel
        height='370'
        indicatorContainerProps={{style: {marginTop: '-5px'}}}
        indicatorIconButtonProps={{style: {margin: '2px', zIndex: 1}}}
        activeIndicatorIconButtonProps={{
          style: {
            backgroundColor: 'primary.contrastText',
            color: WHITE
          }
        }}
        sx={{
          width: '100%',
          height: '370px',
          backgroundColor: 'primary.light',
          color: WHITE,
          padding: '24px',
          borderRadius: '10px'
        }}
      >
        {
          items.map( (item, i) => <Item key={i} item={item} /> )
        }
      </Carousel>
    </div>
  )
}

export default DashboardBanners
