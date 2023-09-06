import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import LogInPage from 'pages/LogInPage';
import ResetPasswordPage from 'pages/ResetPasswordPage';
import { GlobalContext } from './contexts/GlobalContext';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import SignUpPage from 'pages/SignUpPage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import { getAuthUser } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import UserListPage from 'pages/User/UserListPage';
import AdminDashboardPage from 'pages/AdminDashboard/AdminDashboardPage';
import AdminBlogPage from 'pages/AdminBlog/AdminBlogPage';
import BlogsPage from 'pages/BlogsPage';
import StockListPage from 'pages/Stock/StockListPage';
import StockWatchListPage from 'pages/Stock/StockWatchListPage';
import { ContactWidget } from 'components/ContactWidget';
import { getEventSource } from 'services/eventSourceService';
import { Subject } from 'rxjs';
import DebugPage from 'pages/Debug/DebugPage';
import StockTagPage from 'pages/StockTag/StockTagPage';
import ReferralGlobalPolicyListPage from 'pages/ReferralGlobalPolicy/ReferralGlobalPolicyListPage';
import MySubscriptionHistoryPage from 'pages/MySubscription/MySubscriptionHistoryPage';
import ConfigListPage from 'pages/Config/ConfigListPage';
import EmailTemplateListPage from 'pages/EmailTemplate/EmailTemplateListPage';
import TranslationListPage from 'pages/Translation/TranslationListPage';
import StockPage from 'pages/StockPage/StockPage';
import ReactDOM from 'react-dom';
import ClientSettingsPage from 'pages/ClientSettings/ClientSettingsPage';
import AdminSettingsPage from 'pages/AdminSettings/AdminSettingsPage';
import AppLoggedIn from 'AppLoggedIn';


const App = () => {


  const event$ = new Subject();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const role = user?.role || 'guest';

  const [contextValue, setContextValue] = React.useState({
    event$,
    user,
    role,
    setUser,
    setLoading
  });

  const Initalize = async () => {
    const user = await getAuthUser();
    if (user) {
      // const count = await countUnreadMessage();
      // setNotifyCount(count);

      const eventSource = getEventSource();
      eventSource.onmessage = (message) => {
        const event = JSON.parse(message.data);
        event$.next(event);
      }
    }
    ReactDOM.unstable_batchedUpdates(() => {
      setUser(user);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    Initalize();
  }, []);

  React.useEffect(() => {
    setContextValue({
      event$,
      user,
      role: user?.role || 'guest',
      setUser,
      setLoading
    });
  }, [user, loading]);

  const isAdmin = role === 'admin';
  const isGuest = role === 'guest';
  const isMember = role === 'member';
  const isFree = role === 'free';
  const isLoggedIn = isAdmin || isMember || isFree;

  return (
    <GlobalContext.Provider value={contextValue}>
      <BrowserRouter basename="/">
        <Switch>
          <RoleRoute visible={isGuest} loading={loading} path="/" exact component={HomePage} />
          <RoleRoute loading={loading} path="/blogs" exact component={BlogsPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
          <RoleRoute loading={loading} exact path="/reset_password" component={ResetPasswordPage} />
          <RoleRoute loading={loading} exact path="/terms_and_conditions" component={TermAndConditionPage} />
          <RoleRoute loading={loading} exact path="/privacy_policy" component={PrivacyPolicyPage} />
          <RoleRoute visible={isLoggedIn} loading={loading} path="*" component={AppLoggedIn} />
          {/* <Redirect to="/" /> */}
          <RoleRoute loading={loading} component={Error404} />
        </Switch>
      </BrowserRouter>
      {(isMember || isGuest) && <ContactWidget />}
    </GlobalContext.Provider>
  );
}

export default App;
