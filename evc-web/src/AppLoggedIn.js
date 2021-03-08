import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
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
import ProLayout, { PageContainer, SettingDrawer } from '@ant-design/pro-layout';
import {
  UnorderedListOutlined, EyeOutlined, UserOutlined, SettingOutlined, TeamOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { logout } from 'services/authService';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Avatar, Badge, Button, Drawer, Layout, Menu, Typography } from 'antd';

const { Text } = Typography;


const ROUTES = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/stock',
    name: 'Stocks',
    icon: <UnorderedListOutlined />,
    roles: ['admin', 'agent', 'member', 'free']
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    icon: <EyeOutlined />,
    roles: ['member', 'free']
  },
  {
    path: '/user',
    name: 'Users',
    icon: <TeamOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    roles: ['admin', 'agent', 'member', 'free']
  },
];

const AppLoggedIn = props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);

  const { user, role, setUser } = context;
  if (!user) {
    return null;
  }
  const isAdmin = role === 'admin';
  const isFree = role === 'free';
  const isMember = role === 'member';
  const isAgent = role === 'agent';
  const isGuest = role === 'guest';
  const canChangePassword = !isGuest && user?.loginType === 'local';

  const isLoggedIn = isAdmin || isMember || isFree;

  const routes = ROUTES.filter(x => x.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    reactLocalStorage.clear();
    setUser(null);
    // debugger;
    history.push('/');
  }

  return <ProLayout
    route={{ routes }}
    location={{ pathname: '/' }}
    navTheme="dark"
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    menuItemRender={(item, dom) => (
      <Link to={item.path}>
        {dom}
      </Link>
    )}
    rightContentRender={() => (
      <Menu
        mode="horizontal"
        style={{ border: 0 }}
      >
        <Menu.SubMenu key="me" title={<Avatar size={40} icon={<UserOutlined style={{ fontSize: 20 }} />} style={{ backgroundColor: isAdmin ? '#222222' : isAgent ? '#3273A4' : '#15be53' }} />}>
          <Menu.Item key="email" disabled={true}>
            <Text code>{user.profile.email}</Text>
          </Menu.Item>
          <Menu.Item key="logout" onClick={handleLogout}>Log Out</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    )}
  >
    <RoleRoute visible={isAdmin} exact path="/dashboard" component={AdminDashboardPage} />
    <RoleRoute visible={isAdmin} exact path="/blogs/admin" component={AdminBlogPage} />
    <RoleRoute visible={isAdmin} exact path="/referral_policy" component={ReferralGlobalPolicyListPage} />
    <RoleRoute visible={isAdmin} exact path="/user" component={UserListPage} />
    <RoleRoute visible={isAdmin} exact path="/stocktag" component={StockTagPage} />
    <RoleRoute visible={isAdmin} exact path="/translation" component={TranslationListPage} />
    <RoleRoute visible={isAdmin} exact path="/config" component={ConfigListPage} />
    <RoleRoute visible={isAdmin} exact path="/email_template" component={EmailTemplateListPage} />
    <RoleRoute visible={isMember || isFree} path="/watchlist" exact component={StockWatchListPage} />
    <RoleRoute visible={true} path="/stock" exact component={StockListPage} />
    <RoleRoute visible={true} path="/stock/:symbol" exact component={StockPage} />
    <RoleRoute visible={true} path="/settings" component={(isMember || isFree) ? ClientSettingsPage : AdminSettingsPage} />
    <RoleRoute visible={isMember || isFree} path="/subscription/history" exact component={MySubscriptionHistoryPage} />
    <Redirect to={isAdmin || isAgent ? '/dashboard' : '/stock'} />
    <RoleRoute component={Error404} />
  </ProLayout>
}

export default withRouter(AppLoggedIn);
