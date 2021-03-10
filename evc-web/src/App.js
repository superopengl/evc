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
import BlogsPage from 'pages/BlogsPage';
import { ContactWidget } from 'components/ContactWidget';
import { getEventSource } from 'services/eventSourceService';
import { Subject } from 'rxjs';
import ReactDOM from 'react-dom';
import AppLoggedIn from 'AppLoggedIn';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import zhTW from 'antd/lib/locale/zh_TW';

const localeDic = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-TW': zhTW
}

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
  const isLoggedIn = !isGuest;

  const locale = localeDic[user?.profile?.locale] ?? enUS;

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConfigProvider locale={locale}>
        <BrowserRouter basename="/">
          <Switch>
            <RoleRoute loading={loading} path="/blogs" exact component={BlogsPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
            <RoleRoute loading={loading} exact path="/reset_password" component={ResetPasswordPage} />
            <RoleRoute loading={loading} exact path="/terms_and_conditions" component={TermAndConditionPage} />
            <RoleRoute loading={loading} exact path="/privacy_policy" component={PrivacyPolicyPage} />
            {isGuest && <RoleRoute visible={isGuest} loading={loading} path="/" exact component={HomePage} />}
            {isLoggedIn && <RoleRoute visible={isLoggedIn} loading={loading} path="/" component={AppLoggedIn} />}
            {/* <Redirect to="/" /> */}
            <RoleRoute loading={loading} component={Error404} />
          </Switch>
        </BrowserRouter>
        {(isMember || isGuest) && <ContactWidget />}
      </ConfigProvider>
    </GlobalContext.Provider>
  );
}

export default App;
