import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PRIMARY, WHITE, PRIMARY_LIGHT } from '../../common/constants'
import Carousel from 'react-material-ui-carousel'
import { Paper, Chip } from '@mui/material'

const LinkTo = ({ label }) => <Link to='/' style={{color: PRIMARY, fontSize: '22px', margin: '0 5px'}} className='no-anchor-styles'>{label}</Link>

const Item = props => {
  const { t } = useTranslation()
  return (
    <div>
      <h2>{props.item.name}</h2>
      <h1>{props.item.description}</h1>
      <Chip style={{backgroundColor: PRIMARY_LIGHT, color: PRIMARY}} label={t('dashboard.take_a_tour')} color='primary' onClick={() => {}}/>
    </div>
  )
}

const Dashboard = () => {
  const { t } = useTranslation()
  var items = [
    {
      name: "We've made a few changes...",
      description: "open concept lab"
    },
    {
      name: "We've made a few changes2...",
      description: "open concept lab"
    },
    {
      name: "We've made a few changes3...",
      description: "open concept lab"
    },
  ]
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{fontSize: '22px'}}>
        <React.Fragment>
          {t('dashboard.welcome_line')} <LinkTo label={t('auth.sign_in')} /> or <LinkTo label={t('auth.register')} />
          </React.Fragment>
      </div>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{margin: '10px 0', width: '100%', height: '222px', borderRadius: '10px'}}>
        <Carousel
          height='222'
          indicatorContainerProps={{style: {marginTop: '-5px'}}}
          indicatorIconButtonProps={{style: {margin: '2px'}}}
          activeIndicatorIconButtonProps={{
            style: {
              backgroundColor: WHITE,
              color: WHITE
            }
          }}
          sx={{
            width: '100%',
            height: '222px',
            backgroundColor: PRIMARY,
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
    </div>
  )
}

export default Dashboard;
