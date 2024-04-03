import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import get from 'lodash/get';
import HeaderChip from '../common/HeaderChip';
import RepoIcon from '../repos/RepoIcon';
import OwnerIcon from '../common/OwnerIcon';

const CanonicalResolveResult = ({ result }) => {
  const { t } = useTranslation()
  const canonicalURL = result?.request?.url
  const requestedNamespace = result?.request?.namespace
  const didResolve = Boolean(result?.result?.id)
  const requestedNamespaceOwner = requestedNamespace ? get(requestedNamespace.split('/'), 2) : false
  const requestedNamespaceOwnerType = requestedNamespace ? get(requestedNamespace.split('/'), 1) : false
  const registryEntry = result?.url_registry_entry
  const registryNamespace = registryEntry ? registryEntry.split('/url-registry/')[0] + '/' : false
  const registryOwnerType = registryEntry ? registryNamespace.split('/')[1] : false
  const registryOwner = registryEntry ? registryNamespace.split('/')[2] : false
  const isRequestedGlobal = requestedNamespace === '/'
  const isResolvedInGlobalRegistry = registryEntry && !registryOwnerType
  const successKey = registryEntry ? 'resolve_success_with_entry' : 'resolve_success_without_entry'
  const failureKey = registryEntry ? 'resolve_failed_with_entry' : (isRequestedGlobal ? 'resolve_failed_without_entry_global' : 'resolve_failed_without_entry')
  return (
    <div className='col-xs-12' style={{margin: '16px 0', padding: '16px', border: '1px solid #787680', borderRadius: '15px'}}>
      <div className='col-xs-12 padding-0'>
        <Typography sx={{padding: 0, margin: 0, fontWeight: 'bold', color: 'surface.contrastText', fontSize: '16px'}}>
          {t('common.result')}
        </Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{marginTop: '4px'}}>
        <Typography component="div" sx={{padding: 0, margin: 0, color: 'secondary.main', fontSize: '14px'}}>
          {
            didResolve && registryEntry &&
              <Trans
                i18nKey={`url_registry.${successKey}`}
                values={{url: `"${canonicalURL}"`}}
                components={[
                  <HeaderChip
                    key={result.result?.id}
                    className='no-anchor-styles'
                    component="a"
                    label={result?.result?.id}
                    icon={<RepoIcon sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + result?.result?.url}
                  />,
                  <HeaderChip
                    key={result.result.owner}
                    className='no-anchor-styles'
                    component="a"
                    label={result.result.owner}
                    icon={<OwnerIcon ownerType={result.result.ownerType} sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + result.result.owner_url}
                  />,
                  isResolvedInGlobalRegistry ?
                    t('url_registry.global') :
                    <HeaderChip
                      key={registryNamespace}
                      className='no-anchor-styles'
                      component="a"
                      label={registryOwner}
                      icon={<OwnerIcon ownerType={registryOwnerType} sx={{color: 'surface.contrastText'}} />}
                      size='small'
                      sx={{margin: '0 4px'}}
                      href={'#' + registryNamespace}
                    />,
                ]}
                shouldUnescape
              />
          }
          {
            didResolve && !registryEntry &&
              <Trans
                i18nKey={`url_registry.${successKey}`}
                values={{url: `"${canonicalURL}"`}}
                components={[
                  <HeaderChip
                    key={result.result?.id}
                    className='no-anchor-styles'
                    component="a"
                    label={result?.result?.id}
                    icon={<RepoIcon sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + result?.result?.url}
                  />,
                  <HeaderChip
                    key={result.result.owner}
                    className='no-anchor-styles'
                    component="a"
                    label={result.result.owner}
                    icon={<OwnerIcon ownerType={result.result.ownerType} sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + result.result.owner_url}
                  />,
                  <HeaderChip
                    key={requestedNamespace}
                    className='no-anchor-styles'
                    component="a"
                    label={requestedNamespaceOwner}
                    icon={<OwnerIcon ownerType={requestedNamespaceOwnerType} sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + requestedNamespace}
                  />,
                ]}
                shouldUnescape
              />
          }
          {
            !didResolve && registryEntry &&
              <Trans
                i18nKey={`url_registry.${failureKey}`}
                values={{url: `"${canonicalURL}"`}}
                components={[
                  isResolvedInGlobalRegistry ?
                    t('url_registry.global') :
                    <HeaderChip
                      key={registryNamespace}
                      className='no-anchor-styles'
                      component="a"
                      label={registryOwner}
                      icon={<OwnerIcon ownerType={registryOwnerType} sx={{color: 'surface.contrastText'}} />}
                      size='small'
                      sx={{margin: '0 4px'}}
                      href={'#' + registryNamespace}
                    />,
                ]}
                shouldUnescape
              />
          }
          {
            !didResolve && !registryEntry && isRequestedGlobal &&
              <Trans
                i18nKey={`url_registry.${failureKey}`}
                values={{url: `"${canonicalURL}"`}}
                shouldUnescape
              />
          }
          {
            !didResolve && !registryEntry && !isRequestedGlobal &&
              <Trans
                i18nKey={`url_registry.${failureKey}`}
                values={{url: `"${canonicalURL}"`}}
                components={[
                  <HeaderChip
                    key={requestedNamespace}
                    className='no-anchor-styles'
                    component="a"
                    label={requestedNamespaceOwner}
                    icon={<OwnerIcon ownerType={requestedNamespaceOwnerType} sx={{color: 'surface.contrastText'}} />}
                    size='small'
                    sx={{margin: '0 4px'}}
                    href={'#' + requestedNamespace}
                  />
                ]}
                shouldUnescape
              />
          }
        </Typography>
      </div>
    </div>
  )
}

export default CanonicalResolveResult
