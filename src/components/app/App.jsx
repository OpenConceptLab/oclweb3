/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  recordGAPageView
} from '../../common/utils';
import Error404 from '../errors/Error404';
import ErrorBoundary from '../errors/ErrorBoundary';
import Footer from './Footer';
import DocumentTitle from "./DocumentTitle"
import './App.scss';
import { hotjar } from 'react-hotjar';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import Search from '../search/Search';
import OIDLoginCallback from '../users/OIDLoginCallback';
import { OperationsContext } from './LayoutContext';
import Alert from '../common/Alert';
import RepoHome from '../repos/RepoHome';

const App = props => {
  const { alert, setAlert } = React.useContext(OperationsContext);
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
      <Header>
        <ErrorBoundary>
          <main className='content'>
            <Switch>
              <Route exact path="/oidc/login" component={OIDLoginCallback} />
              <Route exact path="/search" component={Search} />
              <Route exact path="/" component={Dashboard} />
              <Route path="/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:repoVersion?" component={RepoHome} />
              <Route component={Error404} />
            </Switch>
            <Alert message={alert?.message} onClose={() => setAlert(false)} severity={alert?.severity} duration={alert?.duration} />
          </main>
        </ErrorBoundary>
        <Footer {...props} />
      </Header>
    </div>
  );
}

export default withRouter(App);

