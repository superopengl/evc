import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { BrowserRouter, Switch } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import LogInPage from 'pages/LogInPage';
import ResetPasswordPage from 'pages/ResetPasswordPage';
import { GlobalContext } from './contexts/GlobalContext';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import SignUpPage from 'pages/SignUpPage';
import TermAndConditionPage from 'pages/TermAndConditionPage';
import Error404 from 'pages/Error404';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage';
import MyTaskListPage from 'pages/MyTask/MyTaskListPage';
import TaskTemplatePage from 'pages/TaskTemplate/TaskTemplatePage';
import DocTemplatePage from 'pages/DocTemplate/DocTemplatePage';
import PortfolioListPage from 'pages/Portfolio/PortfolioListPage';
import AdminTaskListPage from 'pages/AdminTask/AdminTaskListPage';
import ProceedTaskPage from 'pages/AdminTask/ProceedTaskPage';
import { getAuthUser } from 'services/authService';
import { RoleRoute } from 'components/RoleRoute';
import MyTaskPage from 'pages/MyTask/MyTaskPage';
import RecurringListPage from 'pages/Recurring/RecurringListPage';
import MessagePage from 'pages/Message/MessagePage';
import UserListPage from 'pages/User/UserListPage';
import ImpersonatePage from 'pages/Impersonate/ImpersonatePage';
import { countUnreadMessage } from 'services/messageService';
import PortfolioFormPage from 'pages/Portfolio/PortfolioFormPage';
import DeclarationPage from 'pages/DeclarationPage';
import ClientHomePage from 'pages/ClientHome/ClientHomePage';
import AdminStatsPage from 'pages/AdminStats/AdminStatsPage';
import AdminBoardPage from 'pages/AdminBoard/AdminBoardPage';
import AdminBlogPage from 'pages/AdminBlog/AdminBlogPage';
import BlogsPage from 'pages/BlogsPage';
import ProfilePage from 'pages/Profile/ProfilePage';
import StockListPage from 'pages/Stock/StockListPage';
import StockPage from 'pages/Stock/StockPage';
import { ContactWidget } from 'components/ContactWidget';
import MyAccountPage from 'pages/MyAccount/MyAccountPage';
import { getEventSource } from 'services/eventSevice';
import {Subject} from 'rxjs';
import DebugPage from 'pages/Debug/DebugPage';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      role: 'guest',
      loading: true,
      setUser: this.setUser,
      setLoading: this.setLoading,
      notifyCount: 0,
      setNotifyCount: this.setNotifyCount,
      event$: new Subject()
    };
  }

  async componentDidMount() {
    this.setLoading(true);
    const user = await getAuthUser();
    if (user) {
      this.setUser(user);
      const count = await countUnreadMessage();
      this.setNotifyCount(count);

      const eventSource = getEventSource();
      eventSource.onmessage = (message) => {
        const event = JSON.parse(message.data);
        this.state.event$.next(event);
      }
    }
    this.setLoading(false);
  }

  setUser = (user) => {
    this.setState({ user, role: user ? user.role : 'guest' });
  }

  setLoading = (value) => {
    this.setState({ loading: !!value });
  }

  setNotifyCount = (value) => {
    this.setState({ notifyCount: value });
  }

  render() {
    const { role, loading } = this.state;
    const isAdmin = role === 'admin';
    const isGuest = role === 'guest';
    const isClient = role === 'client';
    const isAgent = role === 'agent';

    return (
      <GlobalContext.Provider value={this.state}>
        <BrowserRouter basename="/">
          <Switch>
            <RoleRoute loading={loading} path="/" exact component={isGuest ? HomePage : isClient ? ClientHomePage : isAdmin ? StockListPage : Error404} />
            <RoleRoute loading={loading} path="/blogs" exact component={BlogsPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/blogs/admin" component={AdminBlogPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/login" component={LogInPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/signup" component={SignUpPage} />
            <RoleRoute visible={isGuest} loading={loading} exact path="/forgot_password" component={ForgotPasswordPage} />
            <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/stats" component={AdminStatsPage} />
            {/* <RoleRoute visible={isAdmin || isAgent} loading={loading} exact path="/board" component={AdminBoardPage} /> */}
            {/* <RoleRoute visible={isClient} loading={loading} exact path="/landing" component={ClientDashboardPage} /> */}
            <RoleRoute visible={isClient} loading={loading} exact path="/portfolios" component={PortfolioListPage} />
            <RoleRoute visible={!isGuest} loading={loading} exact path="/portfolios/:id" component={PortfolioFormPage} />
            <RoleRoute visible={!isGuest} loading={loading} exact path="/portfolios/new/:type" component={PortfolioFormPage} />
            <RoleRoute loading={loading} path="/reset_password" exact component={ResetPasswordPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/task_template" component={TaskTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/debug" component={DebugPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/task_template/:id" component={TaskTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/doc_template" component={DocTemplatePage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/user" component={UserListPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/recurring" component={RecurringListPage} />
            <RoleRoute visible={isAdmin} loading={loading} exact path="/impersonate" component={ImpersonatePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/message" exact component={MessagePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/stock/new" exact component={StockPage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/stock/:id" exact component={StockPage} />
            {/* <RoleRoute visible={isAdmin || isAgent || isClient} loading={loading} path="/stock" exact component={StockListPage} /> */}
            <RoleRoute visible={!isGuest} loading={loading} path="/profile" exact component={ProfilePage} />
            <RoleRoute visible={!isGuest} loading={loading} path="/change_password" exact component={ChangePasswordPage} />
            <RoleRoute visible={isClient} loading={loading} path="/account" exact component={MyAccountPage} />
            <RoleRoute loading={loading} path="/terms_and_conditions" exact component={TermAndConditionPage} />
            <RoleRoute loading={loading} path="/privacy_policy" exact component={PrivacyPolicyPage} />
            <RoleRoute loading={loading} path="/declaration" exact component={DeclarationPage} />
            {/* <Redirect to="/" /> */}
            <RoleRoute loading={loading} component={Error404} />

          </Switch>
        </BrowserRouter>
        <ContactWidget />
      </GlobalContext.Provider>
    );
  }
}

export default App;
