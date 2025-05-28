import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next'
import './Tasks.scss';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';
import {
  Accordion, AccordionDetails, AccordionSummary, Tooltip, Divider, Button, Chip,
} from '@mui/material';
import { get, includes, last, isObject } from 'lodash';
import { formatDateTime } from '../../common/utils';
import { WHITE, ERROR_COLORS } from '../../common/colors';
import TaskIcon from './TaskIcon';

const ExpiredResult = ({label}) => (
  <Chip variant='outlined' label={label} sx={{border: `1px solid ${ERROR_COLORS.main}`, color: ERROR_COLORS.main}} size='small' />
);

const TASK_RESULT_EXPIRY_HOURS = 72;

const Task = ({task, open, onOpen, onClose, onRevoke, onDownload}) => {
  const { t } = useTranslation()
  const { state, result } = task
  const details = task?.details || task
  const status = state.toLowerCase()
  const id = task.id || task.task
  const startedAt = (task.started_at || task.created_at) || (task.details.started * 1000)
  const hasResultExpired = status === 'success' && moment.duration(moment(new Date()).diff(moment(startedAt))).asHours() > TASK_RESULT_EXPIRY_HOURS;
  const onChange = () => open ? onClose() : onOpen(id)
  const getTemplate = (label, value, type) => {
    let formattedValue = value
    if(type === 'timestamp' && value)
      formattedValue = formatDateTime(value*1000)
    if(type === 'datetime' && value)
      formattedValue = formatDateTime(value)

    return (
      <React.Fragment>
        <div className='col-xs-3 padding-left-0' style={{margin: '5px 0'}}>
          {label}:
        </div>
        {
          (type === 'list' && formattedValue) ? (
            <div className='col-xs-9 padding-right-0' style={{overflow: 'auto'}}>
              {
                formattedValue.map(subValue => (
                  <div key={subValue} className='col-xs-12 padding-right-0' style={{margin: '5px 0', overflow: 'auto'}}>
                    {subValue}
                  </div>
                ))
              }
            </div>
          ) :
            <div className='col-xs-9 padding-right-0' style={{margin: '5px 0', overflow: 'auto'}}>
              {formattedValue || ' - '}
            </div>
        }
        <Divider style={{width: '100%', display: 'inline-block'}}/>
      </React.Fragment>
    )
  }

  const onCancelTaskClick = event => {
    event.stopPropagation()
    event.preventDefault()
    onRevoke(id)
    return false
  }

  const onDownloadTaskClick = event => {
    event.stopPropagation()
    event.preventDefault()
    onDownload(id)
    return false
  }

  return (
    <Accordion expanded={open} onChange={onChange} sx={open ? {} : {margin: '6px 0'}}>
      <AccordionSummary expandIcon={<ExpandIcon />} id={id} className={status}>
        <Tooltip arrow title={state}>
          <div className='col-xs-12 padding-0 task-summary flex-vertical-center'>
            <div className='col-xs-1 padding-left-0'>
              <TaskIcon status={status} />
            </div>
            <div className='col-xs-11 padding-0'>
              <div className='col-xs-12 padding-0'><b>{id}</b></div>
              <div className='col-xs-12 padding-0 flex-vertical-center'>
                <div className='col-xs-8 padding-left-0'>
                  <div className='col-xs-12 padding-0 sub-text italic'>
                    {t('import.received')}: <b>{formatDateTime(details.created_at || (details.received * 1000))}</b>
                  </div>
                  <div className='col-xs-12 padding-0 sub-text italic'>
                    {t('import.queue')}: <b>{task.queue || last(task.task.split('~'))}</b>
                  </div>
                </div>
                <div className='col-xs-4 padding-0'>
                  {
                    includes(['started', 'received', 'pending'], status) &&
                      <Button
                        size='small'
                        variant='contained'
                        onClick={onCancelTaskClick}
                        style={{backgroundColor: ERROR_COLORS.main, color: WHITE, padding: '0 5px', fontSize: '0.7125rem', marginLeft: '10px', marginTop: '3px'}}
                      >
                        {t('common.cancel')}
                      </Button>
                  }
                  {
                    status === 'success' && !hasResultExpired &&
                      <Button
                        size='small'
                        variant='contained'
                        onClick={onDownloadTaskClick}
                        sx={{backgroundColor: 'success.main', color: WHITE, padding: '0 5px', fontSize: '0.7125rem', marginLeft: '10px', marginTop: '3px'}}
                      >
                        {t('import.download_report')}
                      </Button>
                  }
                  {
                    hasResultExpired &&
                      <ExpiredResult label={t('import.result_expired')} />
                  }
                </div>
              </div>
              {
                isObject(task?.summary) &&
                  <div className='col-xs-12 padding-0 sub-text italic'>
                    { JSON.stringify(task.summary, undefined, 2) }
                  </div>
              }
              {
                get(result, 'summary') &&
                  <div className='col-xs-12 padding-0 sub-text italic'>
                    { result.summary }
                  </div>
              }
            </div>
          </div>
        </Tooltip>
      </AccordionSummary>
      <AccordionDetails>
        <div className='col-xs-12 padding-0'>
          { getTemplate(t('import.task_id'), id) }
          { getTemplate(t('common.name'), details.name) }
          { getTemplate(t('import.received'), details.created_at || details.received, details?.id ? 'datetime': 'timestamp') }
          { getTemplate(t('import.started'), details.started_at || details.started, details?.id ? 'datetime': 'timestamp') }
          { details.runtime && getTemplate(t('import.runtime'), `${details.runtime} secs`) }
          { details.failed && getTemplate(t('import.failed'), details.failed, 'timestamp') }
          { getTemplate(t('import.retries'), details.retries) }
          { details.revoked && getTemplate(t('import.revoked'), details.revoked, 'timestamp') }
          { details.exception && getTemplate(t('import.exception'), details.exception) }
          { status === 'success' && getTemplate(t('import.result'), details.result) }
          { details.args && getTemplate(t('import.args'), details.args) }
          { details.children && getTemplate(t('import.sub_tasks'), details.children, 'list') }
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default Task;
