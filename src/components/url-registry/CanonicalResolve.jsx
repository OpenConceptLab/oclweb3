import React from 'react';
import { Trans, useTranslation } from 'react-i18next'
import { DialogContent, Typography, TextField } from '@mui/material'
import get from 'lodash/get'
import { URL_REGISTRY_DOC_LINK } from '../../common/constants'
import APIService from '../../services/APIService';
import Button from '../common/Button';
import Dialog from '../common/Dialog'
import DialogTitle from '../common/DialogTitle'
import NamespaceDropdown from './NamespaceDropdown'
import CanonicalResolveResult from './CanonicalResolveResult';

const CanonicalResolve = ({open, onClose, defaultOwner}) => {
  const { t } = useTranslation()
  const [owner, setOwner] = React.useState(defaultOwner || '/')
  const [canonicalURL, setCanonicalURL] = React.useState('')
  const [result, setResult] = React.useState(false)
  const [isResolving, setIsResolving] = React.useState(false)
  const onOwnerChange = (event, item) => {
    setOwner(item?.url || '/')
  }

  const onResolve = () => {
    setResult(false)
    setIsResolving(true)
    APIService.new().overrideURL('/$resolveReference/').post({url: canonicalURL, namespace: owner, version: 'HEAD'}).then(response => {
      setIsResolving(false)
      setResult({status: response.status, ...(get(response, 'data[0]') || {})})
    })
  }

  const onURLChange = event => {
    setResult(false)
    setCanonicalURL(event.target.value || '')
  }

  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        {t('url_registry.test_canonical_url')}
        <Typography component='div' sx={{paddingTop: '16px', color: 'surface.contrastText', fontSize: '14px'}}>
          <Trans
            i18nKey='url_registry.test_canonical_url_description'
            components={[<a key={URL_REGISTRY_DOC_LINK} className='link' rel='noreferrer noopener' target='_blank' href={URL_REGISTRY_DOC_LINK} />]}
          />
        </Typography>
      </DialogTitle>
      <DialogContent sx={{padding: '16px 0 0 0 !important'}}>
        <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center'}}>
          <div className='col-xs-4' style={{paddingRight: '8px', paddingLeft: 0}}>
            <NamespaceDropdown
              backgroundColor='surface.n92'
              onChange={onOwnerChange}
              owner={owner}
              label={t('url_registry.registry_owner')}
              id='url_registry.registry_owner'
            />
          </div>
          <div className='col-xs-6' style={{paddingRight: '8px', paddingLeft: 0}}>
            <TextField
              onChange={onURLChange}
              label={t('url_registry.canonical_url')}
              fullWidth
              sx={{backgroundColor: 'surface.n92'}}
            />
          </div>
          <div className='col-xs-2 padding-0'>
            <Button label={t('common.resolve')} color='primary' onClick={onResolve} disabled={!owner || !canonicalURL || isResolving} />
          </div>
        </div>
        {
          result?.status &&
            <CanonicalResolveResult result={result} />
        }
      </DialogContent>
    </Dialog>
  )
}

export default CanonicalResolve;
