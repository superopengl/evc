import React from 'react';
import 'antd/dist/antd.less';
import { BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import { ContactWidget } from 'components/ContactWidget';
import { getEventSource } from 'services/eventSourceService';
import { Subject } from 'rxjs';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import zhTW from 'antd/lib/locale/zh_TW';
import loadable from '@loadable/component'

const SignUpPage = loadable(() => import('pages/SignUpPage'));
const Error404 = loadable(() => import('pages/Error404'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ResetPasswordPage = loadable(() => import('pages/ResetPasswordPage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
const TermAndConditionPage = loadable(() => import('pages/TermAndConditionPage'));
const AppLoggedIn = loadable(() => import('AppLoggedIn'));


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
        {isGuest && <ContactWidget />}
      </ConfigProvider>
    </GlobalContext.Provider>
  );
}

export default App;
