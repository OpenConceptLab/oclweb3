/*eslint no-process-env: 0*/
import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import {
  recordGAPageView, isLoggedIn, getCurrentUser, getLoginURL, isMapperURL, isRedirectingToLoginViaReferrer
} from '../../common/utils';
import Error404 from '../errors/Error404';
import Error403 from '../errors/Error403';
import Error401 from '../errors/Error401';
import ErrorBoundary from '../errors/ErrorBoundary';
import Footer from './Footer';
import DocumentTitle from "./DocumentTitle"
import './App.scss';
import { hotjar } from 'react-hotjar';
import APIService from '../../services/APIService'
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import Search from '../search/Search';
import OIDLoginCallback from '../users/OIDLoginCallback';
import { OperationsContext } from './LayoutContext';
import Alert from '../common/Alert';
import RepoHome from '../repos/RepoHome';
import RepoCreate from '../repos/RepoCreate'
import CompareVersions from '../repos/CompareVersions';
import UserHome from '../users/UserHome'
import UserEdit from '../users/UserEdit';
import UserSettings from '../users/UserSettings';
import OrgHome from '../orgs/OrgHome';
import URLRegistry from '../url-registry/URLRegistry'
import RepoConceptsMatch from '../repos/RepoConceptsMatch'
import Matching from '../repos/Matching'
import SigninRedirect from './SigninRedirect'
import SignupRedirect from './SignupRedirect'
import OrgCreate from '../orgs/OrgCreate'
import ImportHome from '../imports/ImportHome'
import ConceptsComparison from '../concepts/ConceptsComparison'
import MappingsComparison from '../mappings/MappingsComparison'
import CheckAuth from './CheckAuth'

const AuthenticationRequiredRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={
      props => isLoggedIn() ?
        <Component {...props} /> :
      isRedirectingToLoginViaReferrer(props.location) ?
        <CheckAuth /> :
      <Error401 />
    }
  />
)

const SessionUserRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => getCurrentUser()?.username === rest?.computedMatch?.params?.user ? <Component {...props} /> : <Error403 />}
  />
)

const App = props => {
  const { alert, setAlert, setToggles } = React.useContext(OperationsContext);
  const setupHotJar = () => {
    /*eslint no-undef: 0*/
    const HID = window.HOTJAR_ID || process.env.HOTJAR_ID
    if(HID)
      hotjar.initialize(HID, 6);
  }

  const fetchToggles = async () => {
    return new Promise(resolve => {
      APIService.toggles().get().then(response => {
        setToggles(response.data)
        resolve();
      });
    });
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

  const forceLoginUser = () => {
    const { search, hash, pathname } = props.location
    const queryParams = new URLSearchParams(search)
    const referrer = queryParams.get('referrer')
    if(isLoggedIn()) {
      window.location.hash = '#'  + pathname
    } else if(referrer && isMapperURL(referrer) && !isLoggedIn()) {
      const parts = hash.split('?')
      let params = new URLSearchParams(parts[1])
      if(params.get('auth') === 'true') {
        window.location.href = getLoginURL(window.location.origin + '/#' + pathname)
      }
    }
  }

  React.useEffect(() => {
    forceLoginUser()
    fetchToggles()
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
              <Route path="/signin" component={SigninRedirect} />
              <Route path="/signup" component={SignupRedirect} />
              <Route exact path="/search" component={Search} />
              <Route exact path="/" component={Dashboard} />
              <Route exact path="/imports" component={ImportHome} />
              <AuthenticationRequiredRoute exact path={`/:ownerType(users|orgs)/:owner/sources/:repo/:repoVersion/concepts/$match`} component={RepoConceptsMatch} />
              <AuthenticationRequiredRoute exact path={`/:ownerType(users|orgs)/:owner/repos/new/:step?`} component={RepoCreate} />
              <AuthenticationRequiredRoute exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/edit/:step?`} component={RepoCreate} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/compare-versions`} component={CompareVersions} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/edit`} component={RepoCreate} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:repoVersion`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:tab(${repoTabsStr})/:resource?`} component={RepoHome} />
              <Route exact path={`/:ownerType(users|orgs)/:owner/:repoType(sources|collections)/:repo/:repoVersion/:tab(${repoTabsStr})/:resource?`} component={RepoHome} />
              <AuthenticationRequiredRoute exact path='/url-registry' component={URLRegistry} />
              <AuthenticationRequiredRoute exact path='/orgs/:org/url-registry' component={URLRegistry} />
              <AuthenticationRequiredRoute exact path='/users/:user/url-registry' component={URLRegistry} />
              <SessionUserRoute exact path='/users/:user/edit' component={UserEdit} />
              <AuthenticationRequiredRoute path='/users/:user/settings' component={UserSettings} />
              <AuthenticationRequiredRoute path={`/users/:user/:tab(${orgTabsStr})?`} component={UserHome} />
              <AuthenticationRequiredRoute exact path='/$term-match' component={Matching} />
              <AuthenticationRequiredRoute exact path='/orgs/new' component={OrgCreate} />
              <AuthenticationRequiredRoute exact path='/orgs/:org/edit' component={OrgCreate} />
              <Route path={`/orgs/:org/:tab(${orgTabsStr})?`} component={OrgHome} />
              <Route exact path="/concepts/compare" component={ConceptsComparison} />
              <Route exact path="/mappings/compare" component={MappingsComparison} />
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

