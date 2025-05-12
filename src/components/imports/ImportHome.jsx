import React from 'react';
import { get, isArray, forEach, filter, find, reject, orderBy, includes } from 'lodash';
import { Paper } from '@mui/material';
import APIService from '../../services/APIService';
import { getCurrentUserUsername, downloadObject } from '../../common/utils';
import { WHITE } from '../../common/colors'
import NewImport from './NewImport';
import ExistingImports from './ExistingImports';

class ImportHome extends React.Component {
  constructor(props) {
    super(props)
    this.service = APIService.new().overrideURL('/importers/bulk-import/')
    this.state = {
      intervals: [],
      tasks: [],
      importListError: null,
      isLoadingImports: true,
    }
  }

  componentDidMount() {
    this.fetchImports()
  }

  fetchImports() {
    this.stopAllPolling()
    this.setState({isLoadingImports: true, importListError: null, tasks: [], intervals: []}, () => {
      this.service.get(null, null, {verbose: true, username: getCurrentUserUsername()})
        .then(res => {
          const data = get(res, 'data')
          if(isArray(data))
            this.setState({tasks: orderBy(data, 'details.received', 'desc'), isLoadingImports: false}, () => {
              this.queryStartedTasks(filter(this.state.tasks, task => includes(['STARTED', 'RECEIVED', 'PENDING'], task.state)))
            })
          else
            this.setState({importListError: res, isLoadingImports: false})
        })
    })

  }

  stopPoll(taskId) {
    clearTimeout(get(find(this.state.intervals, {id: taskId}), 'interval'))
    this.setState({intervals: reject(this.state.intervals, {id: taskId})})
  }

  stopAllPolling() {
    forEach(this.state.intervals, interval => clearTimeout(interval.interval))
  }

  updateTaskStatus(task, newStatus) {
    const newState = {...this.state}
    const existingTask = find(newState.tasks, {task: task.id})
    existingTask.state = newStatus
    if(existingTask.details)
      existingTask.details.state = newStatus
    this.setState(newState)
  }

  fetchStartedTaskUpdates(task) {
    return setTimeout(() => {
      this.service.get(null, null, {task: task.id}).then(res => {
        const data = get(res, 'data')
        if(data) {
          if(task.state === 'RECEIVED' && data.state === 'REVOKED') {
            this.stopPoll(task.id)
            this.updateTaskStatus(task, 'REVOKED')
          }
          else if(data.state !== task.state) {
            this.stopPoll(task.id)
            this.fetchImports()
          } else if (data?.id && data?.summary) {
            const newState = {...this.state}
            const existingTask = find(this.state.tasks, {id: task.id})
            existingTask.summary = data.summary
            existingTask.runtime = data.runtime
            this.setState(newState)
            this.fetchStartedTaskUpdates(task)
          }
        } else {
          this.stopPoll(task.id)
          this.fetchImports()
        }
      })
    }, 5000)
  }

  queryStartedTasks(startedTasks) {
    forEach(startedTasks, task => {
      const newInterval = {id: task.id, interval: this.fetchStartedTaskUpdates(task)}
      this.setState({intervals: [...this.state.intervals, newInterval]})
    })
  }

  onRevokeTask = taskId => {
    if(taskId) {
      const task = find(this.state.tasks, {task: taskId})
      const children = get(task, 'details.children') || [];
      forEach(children, childTaskId => {
        APIService.new().overrideURL('/importers/bulk-import/').delete({task_id: childTaskId}).then(() => {})
      })

      APIService.new().overrideURL('/importers/bulk-import/').delete({task_id: taskId}).then(() => {
        this.stopPoll(task);
        task.state === 'RECEIVED' ? this.updateTaskStatus(task, 'REVOKED') : this.fetchImports()
      })
    }
  }

  onDownloadTask = taskId => {
    if(taskId) {
      APIService.new().overrideURL('/importers/bulk-import/').get(null, null, {task: taskId, result: 'json'}).then(res => {
        if(get(res, 'data')) {
          downloadObject(JSON.stringify(res.data, undefined, 2), 'application/json', `${taskId}.json`)
        }
      })
    }
  }

  render() {
    const { isLoadingImports, tasks, importListError } = this.state;
    return (
      <div className='col-xs-12 padding-0' style={{borderRadius: '10px'}}>
        <Paper component="div" className='col-xs-6 split' sx={{backgroundColor: 'white', borderRadius: '10px', boxShadow: 'none', padding: '0 16px 16px', border: 'solid 0.3px', borderColor: 'surface.nv80'}}>
          <NewImport onUploadSuccess={this.fetchImports} />
        </Paper>
        <Paper className='col-xs-6 split-appear' style={{marginLeft: '16px', width: 'calc(50% - 16px)', padding: '0 16px 16px', backgroundColor: WHITE, borderRadius: '10px', height: 'calc(100vh - 100px)', overflow: 'auto'}}>
          <ExistingImports
            tasks={tasks}
            isLoading={isLoadingImports}
            onRefresh={() => this.fetchImports()}
            onRevoke={this.onRevokeTask}
            onDownload={this.onDownloadTask}
            error={importListError}
          />
        </Paper>
      </div>
    )
  }
}

export default ImportHome;
