import React from 'react';
import APIService from '../services/APIService';
import { isTaskFinished } from '../components/repos/taskState';

// Tasks a page queued (a reindex, a vector sync) by key, so their action stays disabled while they run.
// check(keys) asks the API about those keys' tasks and forgets each one that has finished, so it can run again.
const useQueuedTasks = () => {
  const [tasks, setTasks] = React.useState({});
  const add = (key, taskId) => setTasks(prev => ({ ...prev, [key]: { taskId } }));
  const forget = key => setTasks(prev => {
    const next = { ...prev };
    delete next[key];
    return next;
  });
  const check = keys => keys.forEach(key => {
    const taskId = tasks[key]?.taskId;
    if(!taskId) return;
    APIService.new().overrideURL(`/tasks/${taskId}/`).get(null, null, null, true).then(response => {
      if(isTaskFinished(response?.data?.state)) forget(key);
    });
  });
  return { tasks, add, check };
};

export default useQueuedTasks;
