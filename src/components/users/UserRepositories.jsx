import React from 'react';
import Search from '../search/Search';

const UserRepositories = ({ user }) => {
  return (
    <Search
      resource='repos'
      url={user?.url + 'repos/'}
      nested
      noTabs
      filtersHeight='calc(100vh - 100px)'
      resultContainerStyle={{height: 'calc(100vh - 200px)', overflow: 'auto'}}
      containerStyle={{padding: 0}}
      defaultFiltersOpen={false}
      resultSize='medium'
    />
  )
}

export default UserRepositories;
