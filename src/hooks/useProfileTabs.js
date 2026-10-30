import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadProfileTabs } from '../common/plugins/loader';
import { getCurrentUser, hasMapper } from '../common/utils';
import { canSeeMapProjects } from '../common/mapProjects';

let pluginTabsPromise

const loadPluginTabs = () => {
  if(!pluginTabsPromise)
    pluginTabsPromise = loadProfileTabs().then(tabs => Array.isArray(tabs) ? tabs : [])
  return pluginTabsPromise
}

export const usePluginTabs = () => {
  const [tabs, setTabs] = React.useState([])
  React.useEffect(() => { loadPluginTabs().then(setTabs) }, [])
  return tabs
}

const isOwnerTab = (tab, ownerType, owner) => (
  (!tab.ownerTypes || tab.ownerTypes.includes(ownerType)) &&
  (!tab.isVisible || tab.isVisible({ownerType, owner, currentUser: getCurrentUser()}))
)

const useProfileTabs = (ownerType, owner) => {
  const { t } = useTranslation()
  const pluginTabs = usePluginTabs()
  return React.useMemo(() => [
    ...(hasMapper() && canSeeMapProjects(getCurrentUser(), ownerType, owner) ? [{key: 'map-projects', label: t('map_project.mapping_projects')}] : []),
    ...pluginTabs.filter(tab => isOwnerTab(tab, ownerType, owner))
  ], [pluginTabs, ownerType, owner, t])
}

export default useProfileTabs
