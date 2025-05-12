import React from 'react';
import './Tasks.scss';
import { CircularProgress } from '@mui/material';
import { get, map, isEmpty } from 'lodash';
import Task from './Task'

const Tasks = ({ tasks, isLoading, error, onRevoke, onDownload }) => {
  const [open, setOpen] = React.useState(null);

  return (
    <div className='col-xs-12 padding-0' style={{height: 'calc(100vh - 266px)', overflow: 'auto'}}>
      {
        isLoading &&
        <div style={{textAlign: 'center'}}>
          <CircularProgress />
        </div>
      }
      {
        error &&
        <div className='failure' style={{padding: '10px'}}>
          { get(error, 'detail') || get(error, 'exception') || error }
        </div>
      }
      {
        isEmpty(tasks) && !error && !isLoading ?
        'No Tasks Found.' :
        map(
          tasks,
          task => <Task
                    key={task.id || task.task}
                    task={task}
                    open={(task?.id || task.task) == open}
                    onOpen={taskId => setOpen(taskId)}
                    onClose={() => setOpen(null)}
                    onRevoke={onRevoke}
                    onDownload={onDownload}
          />
        )
      }
    </div>
  )
}

export default Tasks
