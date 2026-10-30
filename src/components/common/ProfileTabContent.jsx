import React from 'react';
import APIService from '../../services/APIService';
import { getCurrentUser } from '../../common/utils';
import MapProjects from '../map-projects/MapProjects';

const ProfileTabContent = ({ tab, ownerType, owner, height }) => {
  if(tab.key === 'map-projects')
    return <MapProjects ownerType={ownerType} owner={owner} height={height} />
  const Component = tab.Component
  return Component ? <Component ownerType={ownerType} owner={owner} currentUser={getCurrentUser()} APIService={APIService} height={height} /> : null
}

export default ProfileTabContent
