import React from 'react'
import { useTranslation } from 'react-i18next'
import Carousel from 'react-material-ui-carousel'
import { Chip } from '@mui/material'
import { PRIMARY, WHITE, PRIMARY_LIGHT } from '../../common/constants'
import { getCurrentUser, isLoggedIn, getLoginURL, getRegisterURL } from '../../common/utils';
import AddButton from '../common/AddButton';

const LinkTo = ({ label, href }) => <a href={href} style={{color: PRIMARY, fontSize: '22px'}} className='no-anchor-styles'>{label}</a>

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
  ]
  const authenticated = isLoggedIn()
  const user = getCurrentUser()
  const username = user?.name || user?.username
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{fontSize: '22px'}}>
        {
          authenticated ?
            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
              <span>{t('dashboard.hello')} {username}!</span>
              <span>
                <AddButton label={t('dashboard.create_repository')} color='primary' onClick={() => {}} />
              </span>
            </span>:
          <span>
            {t('dashboard.welcome_line')} <LinkTo label={t('auth.sign_in')} href={getLoginURL()} /> {t('common.or')} <LinkTo label={t('auth.register')} href={getRegisterURL()} />
          </span>
        }
      </div>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{margin: '22px 0', width: '100%', height: '222px', borderRadius: '10px'}}>
        <Carousel
          height='222'
          indicatorContainerProps={{style: {marginTop: '-5px'}}}
          indicatorIconButtonProps={{style: {margin: '2px', zIndex: 1}}}
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
