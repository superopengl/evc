import React from 'react';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import UserListPage from 'pages/User/UserListPage';
import AdminDashboardPage from 'pages/AdminDashboard/AdminDashboardPage';
import AdminBlogPage from 'pages/AdminBlog/AdminBlogPage';
import StockListPage from 'pages/Stock/StockListPage';
import StockWatchListPage from 'pages/Stock/StockWatchListPage';
import TagsSettingPage from 'pages/TagsSettingPage/TagsSettingPage';
import ReferralGlobalPolicyListPage from 'pages/ReferralGlobalPolicy/ReferralGlobalPolicyListPage';
import ConfigListPage from 'pages/Config/ConfigListPage';
import EmailTemplateListPage from 'pages/EmailTemplate/EmailTemplateListPage';
import TranslationListPage from 'pages/Translation/TranslationListPage';
import StockPage from 'pages/StockPage/StockPage';
import ProLayout, { } from '@ant-design/pro-layout';
import {
  UnorderedListOutlined, StarOutlined, UserOutlined, SettingOutlined, TeamOutlined,
  DashboardOutlined, TagsOutlined, DollarOutlined} from '@ant-design/icons';
import { Link, withRouter, Redirect } from 'react-router-dom';
import { logout } from 'services/authService';
import { reactLocalStorage } from 'reactjs-localstorage';
import { Avatar, Space, Dropdown, Menu, Typography, Modal } from 'antd';
import ChangePasswordModal from 'pages/ChangePasswordModal';
import HeaderStockSearch from 'components/HeaderStockSearch';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import MySubscriptionPage from 'pages/MySubscription/MySubscriptionPage';
import AboutDrawer from 'pages/About/AboutDrawer';

const { Link: LinkText } = Typography;

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: white;
}

.ant-pro-global-header {
  padding-left: 24px;
}

.ant-pro-global-header-collapsed-button {
  margin-right: 16px;
}

`;

const StyledMenu = styled(Menu)`
.ant-dropdown-menu-item {
  padding: 12px !important;
}
`;

const ROUTES = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: <DashboardOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    icon: <StarOutlined />,
    roles: ['member', 'free']
  },
  {
    path: '/stock',
    name: 'Stocks',
    icon: <UnorderedListOutlined />,
    roles: ['admin', 'agent', 'member', 'free']
  },
  {
    path: '/user',
    name: 'Users',
    icon: <TeamOutlined />,
    roles: ['admin', 'agent']
  },
  {
    path: '/tags',
    name: 'Tags',
    icon: <TagsOutlined />,
    roles: ['admin', 'agent'],
  },
  {
    path: '/account',
    name: 'Account',
    icon: <DollarOutlined />,
    roles: ['member', 'free'],
  },
  {
    path: '/settings',
    name: 'Settings',
    icon: <SettingOutlined />,
    roles: ['admin', 'agent'],
    routes: [
      {
        path: '/config',
        name: 'Configuration',
      },
      {
        path: '/email_template',
        name: 'Email Templates',
      },
      {
        path: '/translation',
        name: 'Translations',
      },
      {
        path: '/referral_policy',
        name: 'Global Referral Policy',
      }
    ]
  },
];

const AppLoggedIn = props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const { user, role, setUser } = context;
  if (!user) {
    return null;
  }
  const isAdmin = role === 'admin';
  const isFree = role === 'free';
  const isMember = role === 'member';
  const isAgent = role === 'agent';


  const routes = ROUTES.filter(x => !x.roles || x.roles.includes(role));



  const handleLogout = async () => {
    await logout();
    reactLocalStorage.clear();
    setUser(null);
    // debugger;
    history.push('/');
  }

  const avatarMenu = <StyledMenu>
    <Menu.Item key="email" disabled={true}>
      <pre style={{ fontSize: 14, margin: 0 }}>{user.profile.email}</pre>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="profile" onClick={() => setProfileVisible(true)}>Profile</Menu.Item>
    <Menu.Item key="change_password" onClick={() => setChangePasswordVisible(true)}>Change Password</Menu.Item>
    <Menu.Divider />
    <Menu.Item key="logout" danger onClick={handleLogout}>Log Out</Menu.Item>
  </StyledMenu>

  return <StyledLayout
    title="EasyValueCheck"
    logo="/favicon-32x32.png"
    route={{ routes }}
    location={{ pathname: '/' }}
    navTheme="dark"
    siderWidth={220}
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    collapsed={collapsed}
    onCollapse={setCollapsed}
    menuItemRender={(item, dom) => (
      <Link to={item.path}>
        {dom}
      </Link>
    )}
    // collapsedButtonRender={true}
    // postMenuData={menuData => {
    //   return [
    //     {
    //       icon: collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />,
    //       name: ' ',
    //       onTitleClick: () => setCollapsed(!collapsed),
    //     },
    //     ...menuData
    //   ]
    // }}
    headerContentRender={() => (
        <HeaderStockSearch />
    )}
    rightContentRender={() => (
      <div style={{marginLeft: 16}}>
      <Dropdown overlay={avatarMenu} trigger={['click']}>
        <a onClick={e => e.preventDefault()}>
          <Avatar size={40}
            icon={<UserOutlined style={{ fontSize: 20 }} />}
            style={{ backgroundColor: isAdmin ? '#00293d' : isAgent ? '#3273A4' : '#15be53' }}
          />
        </a>
      </Dropdown>
      </div>
    )}
    menuFooterRender={props => (
      props?.collapsed ? null : <Space direction="vertical" style={{width: '100%'}}>
        <LinkText onClick={() => setContactVisible(true)}>Contact Us</LinkText>
        <LinkText onClick={() => setAboutVisible(true)}>About</LinkText>
        <LinkText href="/terms_and_conditions" target="_blank">Terms and Conditions</LinkText>
        <LinkText href="/privacy_policy" target="_blank">Privacy Policy</LinkText>
      </Space>
    )}
  >
    <RoleRoute visible={isAdmin} exact path="/dashboard" component={AdminDashboardPage} />
    <RoleRoute visible={isMember || isFree} path="/watchlist" exact component={StockWatchListPage} />
    <RoleRoute visible={true} path="/stock" exact component={StockListPage} />
    <RoleRoute visible={true} path="/stock/:symbol" exact component={StockPage} />
    <RoleRoute visible={isAdmin} exact path="/blogs/admin" component={AdminBlogPage} />
    <RoleRoute visible={isAdmin} exact path="/user" component={UserListPage} />
    <RoleRoute visible={isAdmin} exact path="/tags" component={TagsSettingPage} />
    <RoleRoute visible={isAdmin} exact path="/config" component={ConfigListPage} />
    <RoleRoute visible={isAdmin} exact path="/email_template" component={EmailTemplateListPage} />
    <RoleRoute visible={isAdmin} exact path="/translation" component={TranslationListPage} />
    <RoleRoute visible={isAdmin} exact path="/referral_policy" component={ReferralGlobalPolicyListPage} />
    <RoleRoute visible={isMember || isFree} path="/account" exact component={MySubscriptionPage} />
    <Redirect to={isAdmin || isAgent ? '/dashboard' : '/stock'} />
    <ChangePasswordModal
      visible={changePasswordVisible}
      onOk={() => setChangePasswordVisible(false)}
      onCancel={() => setChangePasswordVisible(false)}
    />
    <ProfileModal
      visible={profileVisible}
      onOk={() => setProfileVisible(false)}
      onCancel={() => setProfileVisible(false)}
    />
    <Modal
      title="Contact Us"
      visible={contactVisible}
      onOk={() => setContactVisible(false)}
      onCancel={() => setContactVisible(false)}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <ContactForm onDone={() => setContactVisible(false)}></ContactForm>
    </Modal>
    <AboutDrawer 
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
  </StyledLayout>
}

export default withRouter(AppLoggedIn);
