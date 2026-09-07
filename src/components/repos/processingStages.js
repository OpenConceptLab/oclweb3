import get from 'lodash/get';

export const PROCESSING_STAGE_KEYS = [
  'seeded_concepts',
  'seeded_mappings',
  'indexed_concepts',
  'indexed_mappings',
  'exported'
];

export const PROCESSING_STAGE_LABEL_KEYS = {
  seeded_concepts: 'repo.stage_seeded_concepts',
  seeded_mappings: 'repo.stage_seeded_mappings',
  indexed_concepts: 'repo.stage_indexed_concepts',
  indexed_mappings: 'repo.stage_indexed_mappings',
  exported: 'repo.stage_exported'
};

export const PROCESSING_QUERY_PARAMS = { includeStates: true, includeTasks: true };

const SUCCESS_STATES = ['SUCCESS'];
const FAILED_STATES = ['FAILURE', 'REVOKED', 'REJECTED', 'IGNORED'];
const RUNNING_STATES = ['STARTED', 'RECEIVED', 'RETRY'];

export const STAGE_STATUS = {
  DONE: 'done',
  FAILED: 'failed',
  RUNNING: 'running',
  PENDING: 'pending',
  NOT_STARTED: 'notStarted'
};

export const getStageStatus = state => {
  if(!state) return STAGE_STATUS.NOT_STARTED;
  const normalized = String(state).toUpperCase();
  if(SUCCESS_STATES.includes(normalized)) return STAGE_STATUS.DONE;
  if(FAILED_STATES.includes(normalized)) return STAGE_STATUS.FAILED;
  if(RUNNING_STATES.includes(normalized)) return STAGE_STATUS.RUNNING;
  return STAGE_STATUS.PENDING;
};

export const isVersionProcessing = version => Boolean(version?.is_processing);

export const getProcessingStages = version => {
  const states = get(version, 'states') || {};
  const tasks = get(version, 'tasks') || {};

  return PROCESSING_STAGE_KEYS.map(key => {
    const task = tasks[key] || null;
    const state = states[key] || get(task, 'state') || null;

    return {
      key,
      labelKey: PROCESSING_STAGE_LABEL_KEYS[key],
      state,
      // Absent when not yet queued, or once oclapi2 drops the task record at 48h.
      present: Boolean(state || task),
      status: getStageStatus(state),
      taskId: get(task, 'id') || get(task, 'task') || null,
      runtime: get(task, 'runtime'),
      queue: get(task, 'queue') || null,
      startedAt: get(task, 'started_at') || null,
      finishedAt: get(task, 'finished_at') || null,
      message: get(task, 'message') || null
    };
  });
};

export const hasProcessingStages = version => {
  const states = get(version, 'states');
  const tasks = get(version, 'tasks');
  return Boolean((states && Object.keys(states).length) || (tasks && Object.keys(tasks).length));
};

export const getProcessingProgress = version => {
  const stages = getProcessingStages(version);
  const total = stages.length;
  const completed = stages.filter(stage => stage.status === STAGE_STATUS.DONE).length;
  const failed = stages.filter(stage => stage.status === STAGE_STATUS.FAILED);
  // Anchor after the last completed stage so a dropped early record doesn't make the
  // caption point back at seeding when the pipeline is demonstrably past it.
  const lastDoneIndex = stages.reduce(
    (last, stage, index) => (stage.status === STAGE_STATUS.DONE ? index : last),
    -1
  );
  const remaining = stages.slice(lastDoneIndex + 1);
  const current = stages.find(stage => stage.status === STAGE_STATUS.RUNNING) ||
    remaining.find(stage => stage.status === STAGE_STATUS.PENDING) ||
    remaining.find(stage => stage.status === STAGE_STATUS.NOT_STARTED) ||
    null;

  return {
    stages,
    recordedStages: stages.filter(stage => stage.present),
    total,
    completed,
    failed,
    hasFailure: failed.length > 0,
    current,
    percent: total ? Math.round((completed / total) * 100) : 0
  };
};

export const getExportTimeSeconds = version => {
  const raw = get(version, 'extras.__export_time');
  if(raw === null || raw === undefined || raw === '') return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

// Changelog and version comparison read the version's concepts/mappings, so they only
// mean anything once both seed stages have copied them in.
export const areSeedStagesComplete = version => {
  const stages = getProcessingStages(version);
  return ['seeded_concepts', 'seeded_mappings'].every(
    key => get(stages.find(stage => stage.key === key), 'status') === STAGE_STATUS.DONE
  );
};

export const isExportAvailable = version => {
  if(getExportTimeSeconds(version) !== null) return true;
  const exported = getProcessingStages(version).find(stage => stage.key === 'exported');
  return get(exported, 'status') === STAGE_STATUS.DONE;
};

export const formatRuntime = seconds => {
  if(typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) return null;
  if(seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if(minutes < 60) return `${minutes}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

export const truncateTaskId = taskId => {
  if(!taskId) return null;
  const value = String(taskId);
  if(value.length <= 14) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};
