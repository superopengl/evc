import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalContext } from './contexts/GlobalContext';
import { getAuthUser } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import { getEventSource } from 'services/eventSourceService';
import { Subject } from 'rxjs';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import loadable from '@loadable/component'
import { IntlProvider } from "react-intl";
import antdLocaleEN from 'antd/locale/en_US';
import antdLocaleZH from 'antd/locale/zh_CN';
import intlMessagesEN from "./translations/en-US.json";
import intlMessagesZH from "./translations/zh-CN.json";
import { getDefaultLocale } from './util/getDefaultLocale';
import { antdTheme } from './antdTheme';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { reactLocalStorage } from 'reactjs-localstorage';
import { from } from 'rxjs';
import * as moment from 'moment-timezone';
import { Loading } from 'components/Loading';
import { listCustomTags } from 'services/watchListService';

// moment.tz.setDefault('America/New_York');


console.log('Now', moment(1622148159000).format('YYYYMMDD HHmmss Z'));
console.log('Now tz', moment.tz().format('YYYYMMDD HHmmss Z'));

const SignUpPage = loadable(() => import('pages/SignUpPage'));
// const Error404 = loadable(() => import('pages/Error404'));
const LogInPage = loadable(() => import('pages/LogInPage'));
const ResetPasswordPage = loadable(() => import('pages/ResetPasswordPage'));
const ForgotPasswordPage = loadable(() => import('pages/ForgotPasswordPage'));
const PrivacyPolicyPage = loadable(() => import('pages/PrivacyPolicyPage'));
const DisclaimerPage = loadable(() => import('pages/DisclaimerPage'));
const ChineseUserPaymentGuidePage = loadable(() => import('pages/ChineseUserPaymentGuidePage'));
const TermAndConditionPage = loadable(() => import('pages/TermAndConditionPage'));
const HomePage = loadable(() => import('pages/HomePage'));
const AppLoggedIn = loadable(() => import('AppLoggedIn'));
const ProMemberPage = loadable(() => import('pages/ProMember/ProMemberPage'));
const EarningsCalendarPreviewPage = loadable(() => import('pages/EarningsCalendarPreviewPage'));

const localeDic = {
  'en-US': {
    antdLocale: antdLocaleEN,
    intlLocale: 'en',
    intlMessages: intlMessagesEN,
  },
  'zh-CN': {
    antdLocale: antdLocaleZH,
    intlLocale: 'zh',
    intlMessages: intlMessagesZH
  }
}

const DEFAULT_LOCALE = getDefaultLocale();

const App = () => {
  const [ready, setReady] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [locale, setLocale] = React.useState(DEFAULT_LOCALE);
  const [user, setUser] = React.useState(null);
  const [customTags, setCustomTags] = React.useState(null);
  const [event$] = React.useState(new Subject());

  const startEventSource = () => {
    const eventSource = getEventSource();
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data);
      event$.next(event);
    }
  }

  const reloadCustomTags = async () => {
    const tags = await listCustomTags();
    setCustomTags(tags);
  }

  const globalContextValue = {
    event$,
    user: null,
    setUser,
    role: 'guest',
    customTags,
    reloadCustomTags,
    setLoading,
    setLocale: locale => {
      reactLocalStorage.set('locale', locale);
      setLocale(locale);
    }
  }

  const [contextValue, setContextValue] = React.useState(globalContextValue);

  const initalize = async () => {
    const user = await getAuthUser();
    ReactDOM.unstable_batchedUpdates(() => {
      setUser(user);
      setLoading(false);
      setReady(true);
    })
  }

  React.useEffect(() => {
    startEventSource();
    const load$ = from(initalize()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    if (user !== contextValue.user) {
      setContextValue({
        ...contextValue,
        user,
        role: user?.role || 'guest',
      });

      contextValue.setLocale(user?.profile?.locale || DEFAULT_LOCALE);
    }
  }, [user]);

  React.useEffect(() => {
    setContextValue({
      ...contextValue,
      customTags
    })
  }, [customTags]);




  const role = contextValue.role;
  const isAdmin = role === 'admin';
  const isGuest = role === 'guest';
  const isMember = role === 'member';
  const isFree = role === 'free';
  const isLoggedIn = !isGuest;

  const { antdLocale, intlLocale, intlMessages } = localeDic[locale] || localeDic[DEFAULT_LOCALE];

  if (!ready) {
    return <Loading loading={loading} />
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_EVC_GOOGLE_SSO_CLIENT_ID}>
      <ConfigProvider locale={antdLocale} theme={antdTheme}>
        <IntlProvider locale={intlLocale} messages={intlMessages}>
          <BrowserRouter basename="/">
            {/* v6 matches exactly by default, so `exact` is gone. The last route keeps the
                splat because AppLoggedIn renders its own nested <Routes>; v6 ranks the literal
                paths above it, so they still win. */}
            <Routes>
              <Route path="/login" element={<RoleRoute visible={isGuest} loading={loading} component={LogInPage} />} />
              <Route path="/signup" element={<RoleRoute visible={isGuest} loading={loading} component={SignUpPage} />} />
              <Route path="/forgot_password" element={<RoleRoute visible={isGuest} loading={loading} component={ForgotPasswordPage} />} />
              <Route path="/reset_password" element={<RoleRoute loading={loading} component={ResetPasswordPage} />} />
              <Route path="/terms_and_conditions" element={<RoleRoute loading={loading} component={TermAndConditionPage} />} />
              <Route path="/privacy_policy" element={<RoleRoute loading={loading} component={PrivacyPolicyPage} />} />
              <Route path="/disclaimer" element={<RoleRoute loading={loading} component={DisclaimerPage} />} />
              <Route path="/pro-member" element={<RoleRoute loading={loading} component={ProMemberPage} />} />
              <Route path="/earnings_calendar_preview" element={<RoleRoute loading={loading} component={EarningsCalendarPreviewPage} />} />
              <Route path="/chinese_user_payment_guide" element={<RoleRoute loading={loading} component={ChineseUserPaymentGuidePage} />} />
              <Route path="/*" element={<RoleRoute loading={loading} component={isLoggedIn ? AppLoggedIn : HomePage} />} />
            </Routes>
          </BrowserRouter>
        </IntlProvider>
      </ConfigProvider>
      </GoogleOAuthProvider>
    </GlobalContext.Provider>
  );
}

export default App;
