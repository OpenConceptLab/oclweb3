import React from 'react';
import APIService from '../../services/APIService';
import { getCurrentUser } from '../../common/utils';
import MapProjects from '../map-projects/MapProjects';

// eslint-disable-next-line no-undef, no-process-env
const ANALYTICS_URL = window.ANALYTICS_API || process.env.ANALYTICS_API

const ProfileTabContent = ({ tab, ownerType, owner, height }) => {
  if(tab.key === 'map-projects')
    return <MapProjects ownerType={ownerType} owner={owner} height={height} />
  const Component = tab.Component
  return Component ? <Component ownerType={ownerType} owner={owner} currentUser={getCurrentUser()} APIService={APIService} ANALYTICS_URL={ANALYTICS_URL} height={height} /> : null
}

export default ProfileTabContent
