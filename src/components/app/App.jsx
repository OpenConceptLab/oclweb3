/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  recordGAPageView
} from '../../common/utils';
import NotFound from '../common/NotFound';
import ErrorBoundary from '../common/ErrorBoundary';
import Footer from './Footer';
import RootView from './RootView';
import DocumentTitle from "./DocumentTitle"
import './App.scss';
import { hotjar } from 'react-hotjar';


const App = props => {
  const setupHotJar = () => {
    /*eslint no-undef: 0*/
    const HID = window.HOTJAR_ID || process.env.HOTJAR_ID
    if(HID)
      hotjar.initialize(HID, 6);
  }

  const addLogoutListenerForAllTabs = () => window.addEventListener(
    "storage",
    event => {
      if(event.key === 'token' && !event.newValue) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if(!localStorage?.server)
          window.location = '/';
      }
    });

  React.useEffect(() => {
    addLogoutListenerForAllTabs()
    recordGAPageView()
    setupHotJar()
  }, [])

  return (
    <div>
      <DocumentTitle/>
        <ErrorBoundary>
          <main className='content'>
            <Switch>
              <Route exact path="/" component={RootView} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </ErrorBoundary>
        <Footer {...props} />
    </div>
);
}

export default withRouter(App);

