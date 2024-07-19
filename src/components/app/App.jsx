/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  recordGAPageView, isLoggedIn, getCurrentUser
} from '../../common/utils';
import Error404 from '../errors/Error404';
import Error403 from '../errors/Error403';
import Error401 from '../errors/Error401';
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
import UserHome from '../users/UserHome'
import UserRepositories from '../users/UserRepositories'
import UserEdit from '../users/UserEdit';
import UserSettings from '../users/UserSettings';
import OrgHome from '../orgs/OrgHome';
import URLRegistry from '../url-registry/URLRegistry'

const AuthenticationRequiredRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => isLoggedIn() ? <Component {...props} /> : <Error401 />}
  />
)

const SessionUserRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => getCurrentUser()?.username === rest?.computedMatch?.params?.user ? <Component {...props} /> : <Error403 />}
  />
)

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

  const repoTabs = ['concepts', 'mappings', 'versions', 'summary', 'about']
  const orgTabs = ['repos']
  const repoTabsStr = repoTabs.join('|')
  const orgTabsStr = orgTabs.join('|')

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
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:repoVersion`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:tab(${repoTabsStr})/:resource?`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:repoVersion/:tab(${repoTabsStr})/:resource?`} component={RepoHome} />
              <AuthenticationRequiredRoute exact path='/url-registry' component={URLRegistry} />
              <AuthenticationRequiredRoute exact path='/orgs/:org/url-registry' component={URLRegistry} />
              <AuthenticationRequiredRoute exact path='/users/:user/repos' component={UserRepositories} />
              <SessionUserRoute exact path='/users/:user/edit' component={UserEdit} />
              <AuthenticationRequiredRoute exact path='/users/:user' component={UserHome} />
              <AuthenticationRequiredRoute path='/users/:user/settings' component={UserSettings} />
              <Route path={`/orgs/:org/:tab(${orgTabsStr})?`} component={OrgHome} />

              <Route exact path='/403' component={Error403} />
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

