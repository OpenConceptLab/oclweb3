import React from 'react';
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '../common/Button';
import { WHITE } from '../../common/constants';
import CanonicalResolve from './CanonicalResolve';
import NamespaceDropdown from './NamespaceDropdown'
import Search from '../search/Search';

const URLRegistry = () => {
  const { t } = useTranslation()
  const params = useParams()
  const [owner, setOwner] = React.useState(params?.org ? `/orgs/${params.org}/` : '/')
  const [testDialog, setTestDialog] = React.useState(false)
  const onOwnerChange = (event, item) => {
    setOwner(item?.url || '/')
  }

  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12 padding-0 flex-vertical-center' style={{marginBottom: '22px'}}>
        <div className='col-xs-7' style={{paddingRight: '16px', paddingLeft: 0}}>
          <Typography component='h1' sx={{fontSize: '28px', fontWeight: 'bold', color: 'surface.dark'}}>
            {t('url_registry.url_registry')}
          </Typography>
        </div>
        <div className='col-xs-5 padding-0' style={{textAlign: 'right'}}>
          <Button variant='outlined' color='primary' sx={{textTransform: 'none', border: 'none', background: 'transparent'}} label={t('url_registry.test_canonical_url')} onClick={() => setTestDialog(true)} />
          <Button variant='contained' color='primary' sx={{textTransform: 'none', marginLeft: '8px'}} label={t('url_registry.add_entry')} />
        </div>
      </div>
      <div className='col-xs-12' style={{padding: '16px', marginBottom: '8px', backgroundColor: WHITE, borderRadius: '10px'}}>
        <div className='col-xs-3 padding-0'>
          <NamespaceDropdown
            label={t('url_registry.registry_owner')}
            id='url_registry.registry_owner'
            onChange={onOwnerChange}
            owner={owner}
          />
        </div>
        <div className='col-xs-9' style={{paddingLeft: '8px', paddingRight: 0}}>
        </div>
      </div>
      <div className='col-xs-12 padding-0' style={{backgroundColor: WHITE, borderRadius: '10px'}}>
        <Search
          filtersHeight={`calc(100vh - 275px)`}
          resultContainerStyle={{height: `calc(100vh - 375px)`, overflow: 'auto'}}
          resource='url_registry'
          url={owner + 'url-registry/'}
          nested
          noTabs
          containerStyle={{padding: 0}}
          defaultFiltersOpen={false}
          resultSize='medium'
        />
      </div>
      <CanonicalResolve defaultOwner={owner} open={testDialog} onClose={() => setTestDialog(false)} />
    </div>
  )
}

export default URLRegistry;
