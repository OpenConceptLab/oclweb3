import React from 'react';
import APIService from '../services/APIService';
import { PROCESSING_QUERY_PARAMS, isVersionProcessing } from '../components/repos/processingStages';

export const PROCESSING_POLL_INTERVAL_MS = 30000;

const getKey = target => target?.key || target?.url || null;

// Polls every in-flight version on one shared interval rather than a timer each.
// `targets` is [{ key, url }]; returns key -> refreshed version payload.
const useProcessingState = (targets = [], { enabled = true, intervalMs = PROCESSING_POLL_INTERVAL_MS } = {}) => {
  const [updates, setUpdates] = React.useState({});
  const targetsRef = React.useRef([]);
  const inFlightRef = React.useRef(new Set());

  // Primitive so the poll only restarts when the target set actually changes.
  const signature = React.useMemo(
    () => (targets || []).filter(target => getKey(target) && target?.url).map(target => `${getKey(target)}|${target.url}`).sort().join(','),
    [targets]
  );

  React.useEffect(() => {
    targetsRef.current = (targets || []).filter(target => getKey(target) && target?.url);
  }, [targets, signature]);

  const refresh = React.useCallback(key => {
    const target = targetsRef.current.find(item => getKey(item) === key);
    if(!target || inFlightRef.current.has(key)) return Promise.resolve(null);

    inFlightRef.current.add(key);
    return APIService.new()
      .overrideURL(target.url)
      .get(null, null, { verbose: true, includeSummary: true, ...PROCESSING_QUERY_PARAMS }, true)
      .then(response => {
        const data = response?.data || response?.response?.data || null;
        if(data) setUpdates(prev => ({ ...prev, [key]: data }));
        return data;
      })
      .catch(() => null)
      .finally(() => inFlightRef.current.delete(key));
  }, []);

  const refreshAll = React.useCallback(() => {
    targetsRef.current.forEach(target => refresh(getKey(target)));
  }, [refresh]);

  // Callers always hand us targets they just fetched fresh (with processing
  // states/tasks already included), so an immediate refresh here would just
  // repeat that same request. Only poll from here on.
  React.useEffect(() => {
    if(!enabled || !signature) return undefined;

    const timer = window.setInterval(refreshAll, intervalMs);
    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, refreshAll, signature]);

  React.useEffect(() => {
    setUpdates(prev => {
      const activeKeys = new Set((targets || []).map(getKey).filter(Boolean));
      const next = {};
      let changed = false;
      Object.entries(prev).forEach(([key, value]) => {
        if(activeKeys.has(key)) next[key] = value;
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [signature]);

  return { updates, refresh, refreshAll };
};

export const useProcessingVersions = (versions = [], { enabled = true, getKey: keyOf, getURL } = {}) => {
  const resolveKey = keyOf || (version => version?.version_url || version?.url || version?.id);
  const resolveURL = getURL || (version => version?.version_url || version?.url);

  const targets = React.useMemo(
    () => (versions || [])
      .filter(isVersionProcessing)
      .map(version => ({ key: resolveKey(version), url: resolveURL(version) }))
      .filter(target => target.key && target.url),
    [versions]
  );

  const { updates, refresh, refreshAll } = useProcessingState(targets, { enabled });

  const merged = React.useMemo(
    () => (versions || []).map(version => {
      const update = updates[resolveKey(version)];
      return update ? { ...version, ...update } : version;
    }),
    [versions, updates]
  );

  return { versions: merged, updates, refresh, refreshAll };
};

export default useProcessingState;
