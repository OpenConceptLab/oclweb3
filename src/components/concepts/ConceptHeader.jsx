import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import DownIcon from '@mui/icons-material/ArrowDropDown';
import ShareIcon from '@mui/icons-material/Share';
import CloseIconButton from '../common/CloseIconButton';
import Breadcrumbs from '../common/Breadcrumbs'
import { BLACK } from '../../common/constants'

const ConceptHeader = ({concept, onClose, repoURL}) => {
  const { t } = useTranslation()

  return (
    <React.Fragment>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>
          <Breadcrumbs
            owner={concept.owner}
            ownerType={concept.owner_type}
            repo={concept.source}
            repoVersion={concept.latest_source_version}
            repoType='Source Version'
            id={concept.id}
            version={concept.version}
            repoURL={repoURL}
            concept
          />
        </span>
        <span>
          <CloseIconButton color='secondary' onClick={onClose} />
        </span>
      </div>
      <div className='col-xs-12' style={{padding: '8px 0 16px 0'}}>
        <Typography sx={{fontSize: '22px', color: BLACK}} className='searchable'>{concept.display_name}</Typography>
      </div>
      <div className='col-xs-12 padding-0' style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>
          <Chip label={concept.concept_class} sx={{backgroundColor: 'surface.n90', color: 'surface.dark', borderRadius: '4px'}} />
          <Chip label={concept.datatype} sx={{backgroundColor: 'surface.n90', color: 'surface.dark', borderRadius: '4px', marginLeft: '8px'}} />
        </span>
        <span>
          <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
            <DownloadIcon fontSize='inherit' />
          </IconButton>
          <IconButton sx={{color: 'surface.contrastText', mr: 1}}>
            <ShareIcon fontSize='inherit' />
          </IconButton>
          <Button endIcon={<DownIcon fontSize='inherit' />} variant='text' sx={{textTransform: 'none', color: 'surface.contrastText'}}>
            {t('common.actions')}
          </Button>
        </span>
      </div>
    </React.Fragment>
  )
}

export default ConceptHeader;
