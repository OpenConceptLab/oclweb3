import React from 'react';
import { useTranslation } from 'react-i18next'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import DoneIcon from '@mui/icons-material/Done';
import StatsIcon from '@mui/icons-material/ChecklistRtl';
import { SURFACE_COLORS } from '../../common/colors'
import RepoVersionChip from './RepoVersionChip'
import RepoIcon from './RepoIcon'
import ConceptIcon from '../concepts/ConceptIcon';
import JSONIcon from '../common/JSONIcon';

const ButtonControl = ({ label, icon, selected, terminal, onClick, disabled }) => {
  return (
    <Button id={label} sx={{textTransform: 'none', fontWeight: 'bold', backgroundColor: selected ? 'surface.s90' : '', borderRadius: terminal ? '25px' : undefined, '.MuiButton-startIcon': {marginTop: '-2px', marginLeft: 0, marginRight: '6px'}}} color='secondary' startIcon={selected ? <DoneIcon fontSize='inherit' /> : icon} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}


const CompareToolbar = ({version1, version2, versions, metric, onMetricChange, onVersionChange}) => {
  const { t } = useTranslation()
  const isSource = version1?.version_url?.includes('/sources/') && version2?.version_url?.includes('/sources/')
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12' style={{padding: '12px', borderBottom: '0.5px solid', borderTop: '0.5px solid', borderColor: SURFACE_COLORS.nv80, backgroundColor: SURFACE_COLORS.main, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {t('repo.compare')}
          <RepoVersionChip
            compare
            originVersion
            size='small'
            version={version1}
            versions={versions}
            disabledFrom={version2}
            sx={{margin: '0 8px', fontSize: '14px', height: '32px','.MuiSvgIcon-root': {fontSize: '14px', color: 'black'}}}
            onChange={version => onVersionChange('version1', version)}
          />
          {t('common.with')}
          <RepoVersionChip
            compare
            size='small'
            version={version2}
            versions={versions}
            disabledUntil={version1}
            sx={{margin: '0 8px', fontSize: '15px', height: '32px', '.MuiSvgIcon-root': {fontSize: '14px', color: 'black'}}}
            onChange={version => onVersionChange('version2', version)}
          />
        </span>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <ButtonGroup size="small" aria-label="Small button group" color='secondary'>
            <ButtonControl label={t('common.statistics')} selected={metric === 'stats'} terminal onClick={() => onMetricChange('stats')} icon={<StatsIcon fontSize='inherit' />} />
            <ButtonControl label={t('common.metadata')} selected={metric === 'meta'} onClick={() => onMetricChange('meta')} icon={<RepoIcon noTooltip fontSize='inherit' />} />
            {
              isSource &&
                <ButtonControl label={t('concept.concepts')} selected={metric === 'concepts'} onClick={() => onMetricChange('concepts')} icon={<ConceptIcon selected color='secondary' fontSize='inherit' sx={{width: '10px', height: '10px'}} />} />
            }
            <ButtonControl label={t('common.json')} terminal selected={metric === 'json'} onClick={() => onMetricChange('json')} icon={<JSONIcon fontSize='inherit' />} />
          </ButtonGroup>
        </span>
      </div>
    </div>
  )
}

export default CompareToolbar
