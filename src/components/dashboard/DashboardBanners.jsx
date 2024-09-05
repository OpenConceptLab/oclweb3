import React from 'react';
import { useTranslation } from 'react-i18next'
import { WHITE } from '../../common/colors'
import Carousel from 'react-material-ui-carousel'
import { Chip } from '@mui/material'

const Item = props => {
  const { t } = useTranslation()
  return (
    <div>
      <h2>{props.item.name}</h2>
      <h1>{props.item.description}</h1>
      <Chip sx={{backgroundColor: 'primary.dark', color: 'primary.light'}} label={t('dashboard.take_a_tour')} onClick={() => {}}/>
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
    <div className='col-xs-12 padding-0 flex-vertical-center' style={{margin: '16px 0', width: '100%', height: '222px', borderRadius: '10px'}}>
      <Carousel
        height='222'
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
          height: '222px',
          backgroundColor: 'primary.light',
          color: WHITE,
          padding: '20px',
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
