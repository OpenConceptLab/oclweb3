import React from 'react';
import { useTranslation } from 'react-i18next'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import DoneIcon from '@mui/icons-material/Done';
import StatsIcon from '@mui/icons-material/ChecklistRtl';
import { SURFACE_COLORS } from '../../common/colors'
import RepoVersionChip from './RepoVersionChip'
import ExpansionDropDown from './ExpansionDropDown'
import RepoIcon from './RepoIcon'
import ConceptIcon from '../concepts/ConceptIcon';
import JSONIcon from '../common/JSONIcon';

const ButtonControl = ({ label, icon, selected, terminal, onClick, disabled }) => {
  return (
    <Button id={label} sx={[{
      textTransform: 'none',
      fontWeight: 'bold',
      '.MuiButton-startIcon': {marginTop: '-2px', marginLeft: 0, marginRight: '6px'}
    }, selected ? {
      backgroundColor: 'surface.s90'
    } : {
      backgroundColor: ''
    }, terminal ? {
      borderRadius: '25px'
    } : {
      borderRadius: null
    }]} color='secondary' startIcon={selected ? <DoneIcon fontSize='inherit' /> : icon} onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  );
}
const CompareToolbar = ({
  version1, version2, versions, metric, onMetricChange, onVersionChange, isCollection,
  expansion1, expansion2, expansions1, expansions2, expansions1Loading, expansions2Loading, onExpansionChange
}) => {
  const { t } = useTranslation()
  const isSource = version1?.version_url?.includes('/sources/') && version2?.version_url?.includes('/sources/')
  const canCompareContent = isSource || (isCollection && version1?.id && version2?.id)
  return (
    <div className='col-xs-12 padding-0'>
      <div className='col-xs-12' style={{padding: '12px', borderBottom: '0.5px solid', borderTop: '0.5px solid', borderColor: SURFACE_COLORS.nv80, backgroundColor: SURFACE_COLORS.main, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{display: 'flex', alignItems: 'center'}}>
          {t('repo.compare')}
          <RepoVersionChip
            noTooltip
            compare
            originVersion
            size='small'
            version={version1}
            versions={versions}
            disabledFrom={version2}
            sx={{margin: '0 8px', fontSize: '14px', height: '32px', borderRadius: '4px', '.MuiSvgIcon-root': {fontSize: '14px', color: 'black'}}}
            onChange={version => onVersionChange('version1', version)}
          />
          {
            isCollection && version1?.id &&
              <span style={{margin: '0 8px 0 0'}}>
                <ExpansionDropDown
                  variant='outlined'
                  expansions={expansions1}
                  loading={expansions1Loading}
                  selectedExpansion={expansion1}
                  onChange={expansion => onExpansionChange('expansion1', expansion)}
                />
              </span>
          }
          {t('common.with')}
          <RepoVersionChip
            noTooltip
            compare
            size='small'
            version={version2}
            versions={versions}
            disabledUntil={version1}
            sx={{margin: '0 8px', fontSize: '15px', height: '32px', borderRadius: '4px', '.MuiSvgIcon-root': {fontSize: '14px', color: 'black'}}}
            onChange={version => onVersionChange('version2', version)}
          />
          {
            isCollection && version2?.id &&
              <span style={{margin: '0 8px 0 0'}}>
                <ExpansionDropDown
                  variant='outlined'
                  expansions={expansions2}
                  loading={expansions2Loading}
                  selectedExpansion={expansion2}
                  onChange={expansion => onExpansionChange('expansion2', expansion)}
                />
              </span>
          }
        </span>
        <span style={{display: 'flex', alignItems: 'center'}}>
          <ButtonGroup size="small" aria-label="Small button group" color='secondary'>
            <ButtonControl label={t('common.statistics')} selected={metric === 'stats'} terminal onClick={() => onMetricChange('stats')} icon={<StatsIcon fontSize='inherit' />} />
            <ButtonControl label={t('common.metadata')} selected={metric === 'meta'} onClick={() => onMetricChange('meta')} icon={<RepoIcon noTooltip fontSize='inherit' />} />
            {
              canCompareContent &&
                <ButtonControl label={t('common.content')} selected={metric === 'content'} onClick={() => onMetricChange('content')} icon={<ConceptIcon selected color='secondary' fontSize='inherit' sx={{width: '10px', height: '10px'}} />} />
            }
            <ButtonControl label={t('common.json')} terminal selected={metric === 'json'} onClick={() => onMetricChange('json')} icon={<JSONIcon fontSize='inherit' />} />
          </ButtonGroup>
        </span>
      </div>
    </div>
  )
}
export default CompareToolbar
