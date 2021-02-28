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
import TaskTemplatePage from 'pages/TaskTemplate/TaskTemplatePage';
import { getAuthUser } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import MessagePage from 'pages/Message/MessagePage';
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
  const isClient = role === 'client';

  return (
    <GlobalContext.Provider value={contextValue}>
      <BrowserRouter basename="/">
        <Switch>
          <RoleRoute loading={loading} path="/" exact component={isGuest ? HomePage : isClient ? StockWatchListPage : AdminDashboardPage} />
          <RoleRoute loading={loading} path="/blogs" exact component={BlogsPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/blogs/admin" component={AdminBlogPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
          <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
          {/* <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/stats" component={AdminStatsPage} /> */}
          {/* <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/board" component={AdminBoardPage} /> */}
          {/* <RoleRoute visible={isClient} loading={loading} exact path="/landing" component={ClientDashboardPage} /> */}
          {/* <RoleRoute visible={isClient} loading={loading} exact path="/portfolios" component={PortfolioListPage} />
            <RoleRoute visible={!isGuest} loading={loading} exact path="/portfolios/:id" component={PortfolioFormPage} />
            <RoleRoute visible={!isGuest} loading={loading} exact path="/portfolios/new/:type" component={PortfolioFormPage} /> */}
          <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/task_template" component={TaskTemplatePage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/referral_policy" component={ReferralGlobalPolicyListPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/debug" component={DebugPage} />
          {/* <RoleRoute visible={isAdmin} loading={loading} exact path="/task_template/:id" component={jmjm} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/doc_template" component={DocTemplatePage} /> */}
          <RoleRoute visible={isAdmin} loading={loading} exact path="/user" component={UserListPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/stocktag" component={StockTagPage} />
          {/* <RoleRoute visible={isAdmin} loading={loading} exact path="/recurring" component={RecurringListPage} /> */}
          <RoleRoute visible={isAdmin} loading={loading} exact path="/translation" component={TranslationListPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/config" component={ConfigListPage} />
          <RoleRoute visible={isAdmin} loading={loading} exact path="/email_template" component={EmailTemplateListPage} />
          <RoleRoute visible={!isGuest} loading={loading} path="/message" exact component={MessagePage} />
          <RoleRoute visible={!isGuest} loading={loading} path="/stock" exact component={StockListPage} />
          <RoleRoute visible={!isGuest} loading={loading} path="/stock/:symbol" exact component={StockPage} />
          {/* <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/stock" exact component={StockListPage} /> */}
          <RoleRoute visible={!isGuest} loading={loading} path="/settings" component={isGuest ? ClientSettingsPage : AdminSettingsPage} />
          <RoleRoute visible={isClient} loading={loading} path="/subscription/history" exact component={MySubscriptionHistoryPage} />
          <RoleRoute loading={loading} path="/terms_and_conditions" exact component={TermAndConditionPage} />
          <RoleRoute loading={loading} path="/privacy_policy" exact component={PrivacyPolicyPage} />
          {/* <RoleRoute loading={loading} path="/declaration" exact component={DeclarationPage} /> */}
          {/* <Redirect to="/" /> */}
          <RoleRoute loading={loading} component={Error404} />

        </Switch>
      </BrowserRouter>
      {(isClient || isGuest) && <ContactWidget />}
    </GlobalContext.Provider>
  );
}

export default App;
