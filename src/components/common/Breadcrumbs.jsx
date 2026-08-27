import React from 'react';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import RepoIcon from '../repos/RepoIcon';
import ConceptIcon from '../concepts/ConceptIcon';
import MappingIcon from '../mappings/MappingIcon';
import ReferenceIcon from '@mui/icons-material/PentagonRounded';
import DotSeparator from './DotSeparator'
import RepoVersionButton from '../repos/RepoVersionButton'
import RepoTooltip from '../repos/RepoTooltip'
import Box from '@mui/material/Box';
import OwnerButton from './OwnerButton'
import { OperationsContext } from '../app/LayoutContext';
import { copyToClipboard } from '../../common/utils'

const Breadcrumbs = ({owner, ownerType, repo, repoVersion, repoURL, concept, mapping, reference, noIcons, color, fontSize, size, ownerURL, nested, trailing}) => {
  const { t } = useTranslation()
  const { setAlert } = React.useContext(OperationsContext);
  const iconProps = {color: 'secondary', style: {marginRight: '8px', width: '0.8em'}}
  const hideParents = Boolean((concept?.id || mapping?.id || reference?.id) && nested)
  const idSpanStyle = {
    maxWidth: hideParents ? 'calc(100% - 125px)' : '125px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    cursor: 'copy',
  }
  const onCopyId = id => {
    copyToClipboard(id)
    setAlert({message: t('common.copied_to_clipboard'), severity: 'success', duration: 1000})
  }
  return (
    <Box className='col-xs-12 padding-0' sx={{display: 'flex', alignItems: 'center', color: color, fontSize: fontSize}}>
      {
        ownerType && owner && !hideParents &&
          <OwnerButton
            ownerType={ownerType}
            owner={owner}
            ownerURL={ownerURL}
            noIcons={noIcons}
            size={size}
            sx={{
              '.owner-button-label': {
                maxWidth: '125px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '14px',
                whiteSpace: 'nowrap',
              },
              '.MuiButton-startIcon': {
                fontSize: '18px',
              }
            }}
          />
      }
      {
        repo && !hideParents &&
          <React.Fragment>
            <DotSeparator />
            <RepoTooltip repo={{url: repoURL}}>
              <RepoVersionButton
                size={size}
                href={repoURL}
                icon={
                  noIcons ?
                    false :
                    <RepoIcon
                      noTooltip
                      sx={{color: 'secondary', fontSize: '18px'}}
                    />
                }
                sx={{
                  '.repo-button-label': {
                    display: 'inline-block !important',
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  },
                  '.repo-version-label': {
                    display: 'inline-block',
                    maxWidth: '75px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }
                }}
                repo={repo}
                version={repoVersion}
                versionStyle={{fontSize: fontSize || '14px'}}
              />
            </RepoTooltip>
          </React.Fragment>
      }
      {
        concept?.id &&
          <React.Fragment>
            {!hideParents && <DotSeparator />}
            {
              !noIcons &&
                <ConceptIcon
                  selected
                  sx={{
                    fontSize: '18px'
                  }}
                  {...iconProps}
                  color={concept.retired? 'error': 'primary'}
                />
            }
            <Tooltip title={t('common.click_to_copy') + ' ' + concept.id}>
              <span className='searchable' style={idSpanStyle} onClick={() => onCopyId(concept.id)}>
                {concept.id}
              </span>
            </Tooltip>
          </React.Fragment>
      }
      {
        mapping?.id &&
          <React.Fragment>
            {!hideParents && <DotSeparator />}
            {
              !noIcons &&
                <MappingIcon
                  selected
                  {...iconProps}
                  color={mapping.retired? 'error': 'primary'}
                />
            }
            <Tooltip title={t('common.click_to_copy') + ' ' + mapping.id}>
              <span className='searchable' style={idSpanStyle} onClick={() => onCopyId(mapping.id)}>
                {mapping.id}
              </span>
            </Tooltip>
          </React.Fragment>
      }
      {
        reference?.id &&
          <React.Fragment>
            {!hideParents && <DotSeparator />}
            {
              !noIcons &&
                <ReferenceIcon
                  {...iconProps}
                  color={reference.include ? 'primary' : 'error'}
                />
            }
            <Tooltip title={t('common.click_to_copy') + ' ' + reference.id}>
              <span className='searchable' style={idSpanStyle} onClick={() => onCopyId(reference.id)}>
                {reference.id}
              </span>
            </Tooltip>
          </React.Fragment>
      }
      {
        trailing &&
          <span style={{flexShrink: 0, marginLeft: '8px'}}>
            {trailing}
          </span>
      }
    </Box>
  )
}

export default Breadcrumbs;
