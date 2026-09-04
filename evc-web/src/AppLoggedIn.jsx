import React from 'react';
import { GlobalContext } from './contexts/GlobalContext';
import { RoleRoute } from 'components/RoleRoute';
import StockPage from 'pages/StockPage/StockPage';
import { ProLayout } from '@ant-design/pro-components';
import Icon, {
  BarChartOutlined, StarOutlined, UserOutlined, SettingOutlined, TeamOutlined,
  DashboardOutlined, QuestionOutlined, AlertOutlined, WarningOutlined
} from '@ant-design/icons';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { logout } from 'services/authService';
import { Space, Dropdown, Menu, Typography, Modal } from 'antd';
import HeaderStockSearch from 'components/HeaderStockSearch';
import styled from 'styled-components';
import ProfileModal from 'pages/Profile/ProfileModal';
import ContactForm from 'components/ContactForm';
import AboutDrawer from 'pages/About/AboutDrawer';

import { GiReceiveMoney, GiRadarSweep } from 'react-icons/gi';
import { BsCalendar } from 'react-icons/bs';
import { FaMoneyBillWave } from 'react-icons/fa';
import { BiDollar } from 'react-icons/bi';
import EarnCommissionModal from 'pages/EarnCommission/EarnCommissionModal';
import loadable from '@loadable/component'
import { FormattedMessage, useIntl } from 'react-intl';
import { GoDatabase } from 'react-icons/go';
import { RiCoinsLine } from 'react-icons/ri';
import { IoLanguage } from 'react-icons/io5';
import { RiArrowUpDownLine } from 'react-icons/ri';
import { saveProfile } from 'services/userService';
import { APP_TITLE, createPageTitleRender } from 'util/pageTitle';

const AdminDashboardPage = loadable(() => import('pages/AdminDashboard/AdminDashboardPage'));
const StockWatchListPage = loadable(() => import('pages/Stock/StockWatchListPage'));
const StockRadarPage = loadable(() => import('pages/Stock/StockRadarPage'));
const AdminCommissionWithdrawalListPage = loadable(() => import('pages/CommissionWithdrawal/AdminCommissionWithdrawalListPage'));
const TagsSettingPage = loadable(() => import('pages/TagsSettingPage/TagsSettingPage'));
const ReferralGlobalPolicyListPage = loadable(() => import('pages/CommissionGlobalPolicy/CommissionGlobalPolicyListPage'));
const ReferreeDiscountPolicyListPage = loadable(() => import('pages/DiscountGlobalPolicy/DiscountGlobalPolicyListPage'));
const ConfigListPage = loadable(() => import('pages/Config/ConfigListPage'));
const EmailTemplateListPage = loadable(() => import('pages/EmailTemplate/EmailTemplateListPage'));
const MarketPage = loadable(() => import('pages/Market/MarketPage'));
const UserListPage = loadable(() => import('pages/User/UserListPage'));
const MyAccountPage = loadable(() => import('pages/MyAccount/MyAccountPage'));
const ChangePasswordModal = loadable(() => import('components/ChangePasswordModal'));
const OptionPutCallPage = loadable(() => import('pages/AdminDashboard/OptionPutCallPage'));
const UnusualOptionsActivityPage = loadable(() => import('pages/AdminDashboard/UnusualOptionsActivityPage'));
const DataSourcePage = loadable(() => import('pages/AdminDashboard/DataSourcePage'));
const TaskExecutionPage = loadable(() => import('pages/AdminDashboard/TaskExecutionPage'));
const EarningsCalendarPage = loadable(() => import('pages/AdminDashboard/EarningsCalendarPage'));
const RevenuePage = loadable(() => import('pages/AdminDashboard/RevenuePage'));

const { Link: LinkText } = Typography;

const StyledLayout = styled(ProLayout)`
.ant-layout {
  // background-color: white;
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

function getSanitizedPathName(pathname) {
  const match = /\/[^/]+/.exec(pathname);
  return match ? match[0] ?? pathname : pathname;
}

const AppLoggedIn = props => {

  const { history } = props;

  const context = React.useContext(GlobalContext);
  const intl = useIntl();
  const pageTitleRender = React.useMemo(() => createPageTitleRender(intl), [intl]);
  const [changePasswordVisible, setChangePasswordVisible] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const [contactVisible, setContactVisible] = React.useState(false);
  const [aboutVisible, setAboutVisible] = React.useState(false);
  const [earnCommissionVisible, setEarnCommissionVisible] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [pathname, setPathname] = React.useState(getSanitizedPathName(props.location.pathname));

  const { user, role, setUser } = context;

  const isProfileComplete = () => {
    if (!user) return false;
    const { surname, givenName, country } = user.profile;
    const isComplete = surname && givenName && country;
    return !!isComplete;
  }

  React.useEffect(() => {
    if (!isProfileComplete()) {
      setProfileVisible(true);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const isAdmin = role === 'admin';
  const isFree = role === 'free';
  const isMember = role === 'member';
  const isAgent = role === 'agent';


  const ROUTES = [
    {
      path: '/dashboard',
      name: <FormattedMessage id="menu.dashboard" />,
      icon: <DashboardOutlined />,
      roles: ['admin', 'agent']
    },
    {
      path: '/watchlist',
      name: <FormattedMessage id="menu.watchlist" />,
      icon: <StarOutlined />,
      roles: ['member']
    },
    {
      path: '/stock',
      name: <FormattedMessage id="menu.stockRadar" />,
      icon: <Icon component={() => <GiRadarSweep />} />,
      roles: ['admin', 'agent', 'member', 'free']
    },
    {
      path: '/market',
      name: <FormattedMessage id="menu.market" />,
      icon: <BarChartOutlined />,
      roles: ['admin', 'agent', 'member', 'free']
    },
    {
      path: '/earnings_calendar',
      name: <FormattedMessage id="menu.earningsCalendar" />,
      icon: <Icon component={() => <BsCalendar />} />,
      roles: ['admin', 'agent', 'member', 'free']
    },
    {
      path: '/option_put_call',
      name: <FormattedMessage id="menu.optionPutCall" />,
      icon: <Icon component={() => <RiArrowUpDownLine />} />,
      roles: ['admin', 'agent', 'member', 'free']
    },
    {
      path: '/unusual_options_activity',
      name: <FormattedMessage id="menu.unusualOptionsActivity" />,
      icon: <AlertOutlined />,
      roles: ['admin', 'agent', 'member', 'free']
    },
    {
      path: '/user',
      name: <FormattedMessage id="menu.users" />,
      icon: <TeamOutlined />,
      roles: ['admin', 'agent']
    },
    {
      path: '/account',
      name: <FormattedMessage id="menu.account" />,
      icon: <Icon component={() => <BiDollar />} />,
      roles: ['member', 'free'],
    },
    {
      path: '/referral',
      name: <><FormattedMessage id="menu.earnCommission" /> 🔥</>,
      icon: <Icon component={() => <GiReceiveMoney />} />,
      clickHandler: () => setEarnCommissionVisible(true),
      roles: ['member', 'free'],
    },
    {
      path: '/data',
      name: <FormattedMessage id="menu.dataManagement" />,
      icon: <Icon component={() => <GoDatabase />} />,
      roles: ['admin', 'agent']
    },
    {
      path: '/revenue',
      name: <FormattedMessage id="menu.revenue" />,
      icon: <Icon component={() => <RiCoinsLine />} />,
      roles: ['admin', 'agent']
    },
    {
      path: '/comission',
      name: <FormattedMessage id="menu.commissionWithdrawal" />,
      icon: <Icon component={() => <FaMoneyBillWave />} />,
      roles: ['admin', 'agent']
    },
    {
      path: '/settings',
      name: <FormattedMessage id="menu.settings" />,
      icon: <SettingOutlined />,
      roles: ['admin', 'agent'],
      routes: [
        {
          path: '/tags',
          name: <FormattedMessage id="menu.tags" />,
        },
        {
          path: '/config',
          name: <FormattedMessage id="menu.config" />,
        },
        {
          path: '/email_template',
          name: <FormattedMessage id="menu.emailTemplate" />,
        },
        // {
        //   path: '/translation',
        //   name: 'Translations',
        // },
        {
          path: '/commission_policy',
          name: <FormattedMessage id="menu.globalCommissionPolicy" />,
        },
        {
          path: '/discount_policy',
          name: <FormattedMessage id="menu.globalDiscountPolicy" />,
        },
        // {
        //   path: '/tasks',
        //   name: 'Task Execution',
        // },
      ]
    },
    // {
    //   path: '/language',
    //   name: <FormattedMessage id="menu.language" />,
    //   icon: <Icon component={() => <IoLanguage />} />,
    //   clickHandler: () => setEarnCommissionVisible(true),
    //   roles: ['admin', 'agent', 'member', 'free']
    // },
    {
      path: '/language',
      name: <FormattedMessage id="menu.language" />,
      icon: <Icon component={() => <IoLanguage />} />,
      roles: ['admin', 'agent', 'member', 'free'],
      routes: [
        {
          path: '/language/zh',
          name: '中 文',
          clickHandler: () => handleChangeLocale('zh-CN'),
        },
        {
          path: '/language/en',
          name: 'English',
          clickHandler: () => handleChangeLocale('en-US'),
        },
      ]
    },
  ];

  const routes = ROUTES.filter(x => !x.roles || x.roles.includes(role));

  const handleLogout = async () => {
    await logout();
    // reactLocalStorage.clear();
    setUser(null);
    history.push('/');
  }

  const handleChangeLocale = async (locale) => {
    await saveProfile(user.id, { locale });
    window.location.reload(false);
  }

  const avatarMenu = <StyledMenu>
    <Menu.Item key="email" disabled={true}>
      <pre style={{ fontSize: 14, margin: 0 }}>{user.profile.email}</pre>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key="profile" onClick={() => setProfileVisible(true)}>
      <FormattedMessage id="menu.profile" />
    </Menu.Item>
    {user.loginType === 'local' && <Menu.Item key="change_password" onClick={() => setChangePasswordVisible(true)}>
      <FormattedMessage id="menu.changePassword" />
    </Menu.Item>}
    <Menu.Divider />
    <Menu.Item key="logout" danger onClick={handleLogout}>
      <FormattedMessage id="menu.logout" />
    </Menu.Item>
  </StyledMenu>

  return <StyledLayout
    title={APP_TITLE}
    pageTitleRender={pageTitleRender}
    logo="/favicon-32x32.png"
    // logo="/header-logo.png"
    route={{ routes }}
    location={{ pathname }}
    navTheme="dark"
    siderWidth={240}
    fixSiderbar={true}
    fixedHeader={true}
    headerRender={true}
    collapsed={collapsed}
    onCollapse={setCollapsed}
    menuItemRender={(item, dom) => {
      if (item.clickHandler) {
        return <div onClick={() => item.clickHandler()}>
          {dom}
        </div>
      } else {

        return <Link to={item.path} onClick={() => {
          setPathname(item.path);
        }}>
          {dom}
        </Link>
      }
    }}
    // collapsedButtonRender={false}
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
      <>
        {/* <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              position: 'relative',
              top: '20px',
              left: '-24px',
              cursor: 'pointer',
              // fontSize: '16px',
              backgroundColor: '#00293d',
              width: '20px',
              color: 'white'
            }}
          >
            {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
          </div> */}
        <HeaderStockSearch />
      </>
    )}
    // pro-components 3 dropped rightContentRender; avatarProps is the supported way to put the
    // user menu in the sider, which is where it rendered before. Losing this silently makes
    // profile / change password / logout unreachable.
    avatarProps={{
      size: 40,
      icon: <UserOutlined style={{ fontSize: 20 }} />,
      style: { backgroundColor: isAdmin ? '#00293d' : isAgent ? '#3273A4' : '#57BB60' },
      render: (_avatarProps, dom) => (
        <Dropdown popupRender={() => avatarMenu} trigger={['click']}>
          <a onClick={e => e.preventDefault()}>{dom}</a>
        </Dropdown>
      ),
    }}
    menuFooterRender={props => (
      props?.collapsed ?
        <QuestionOutlined style={{ color: 'rgba(255,255,255,0.65' }} onClick={() => setCollapsed(!collapsed)} /> :
        <Space orientation="vertical" style={{ width: 188 }}>
          <LinkText onClick={() => setContactVisible(true)}>Contact Us</LinkText>
          <LinkText onClick={() => setAboutVisible(true)}>About</LinkText>
          <LinkText href="/terms_and_conditions" target="_blank">
            <FormattedMessage id="menu.tc" />
          </LinkText>
          <LinkText href="/privacy_policy" target="_blank">
            <FormattedMessage id="menu.pp" />

          </LinkText>
          <LinkText href="/disclaimer" target="_blank">
            <FormattedMessage id="menu.disclaimer" />

          </LinkText>
        </Space>
    )}
  >
    <Routes>
      <Route path="dashboard" element={<RoleRoute visible={isAdmin} component={AdminDashboardPage} />} />
      <Route path="watchlist" element={<RoleRoute visible={isMember || isFree} component={StockWatchListPage} />} />
      <Route path="option_put_call" element={<RoleRoute visible={true} component={OptionPutCallPage} />} />
      <Route path="unusual_options_activity" element={<RoleRoute visible={true} component={UnusualOptionsActivityPage} />} />
      <Route path="market" element={<RoleRoute visible={true} component={MarketPage} />} />
      <Route path="stock" element={<RoleRoute visible={true} component={StockRadarPage} />} />
      <Route path="stock/:symbol" element={<RoleRoute visible={true} component={StockPage} />} />

      <Route path="earnings_calendar" element={<RoleRoute visible={true} component={() => <EarningsCalendarPage onSymbolClick={symbol => props.history.push(`/stock/${symbol}`)} />} />} />
      <Route path="user" element={<RoleRoute visible={isAdmin} component={UserListPage} />} />
      <Route path="tags" element={<RoleRoute visible={isAdmin} component={TagsSettingPage} />} />
      <Route path="config" element={<RoleRoute visible={isAdmin} component={ConfigListPage} />} />
      <Route path="email_template" element={<RoleRoute visible={isAdmin} component={EmailTemplateListPage} />} />
      {/* <RoleRoute visible={isAdmin} exact path="/translation" component={TranslationListPage} /> */}
      <Route path="commission_policy" element={<RoleRoute visible={isAdmin} component={ReferralGlobalPolicyListPage} />} />
      <Route path="discount_policy" element={<RoleRoute visible={isAdmin} component={ReferreeDiscountPolicyListPage} />} />
      <Route path="data" element={<RoleRoute visible={isAdmin} component={DataSourcePage} />} />
      <Route path="tasks" element={<RoleRoute visible={isAdmin} component={TaskExecutionPage} />} />
      <Route path="revenue" element={<RoleRoute visible={isAdmin} component={RevenuePage} />} />
      <Route path="comission" element={<RoleRoute visible={isAdmin} component={AdminCommissionWithdrawalListPage} />} />
      <Route path="account" element={<RoleRoute visible={isMember || isFree} component={MyAccountPage} />} />
      <Route path="*" element={<Navigate to={(isAdmin || isAgent) ? '/dashboard' : '/stock'} replace />} />
    </Routes>

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
      open={contactVisible}
      onOk={() => setContactVisible(false)}
      onCancel={() => setContactVisible(false)}
      footer={null}
      destroyOnHidden={true} mask={{ closable: false }}>
      <ContactForm onDone={() => setContactVisible(false)}></ContactForm>
    </Modal>
    <AboutDrawer
      visible={aboutVisible}
      onClose={() => setAboutVisible(false)}
    />
    {(isMember || isFree) && <EarnCommissionModal
      visible={earnCommissionVisible}
      onOk={() => setEarnCommissionVisible(false)}
      onCancel={() => setEarnCommissionVisible(false)}
    />}
  </StyledLayout>
}

export default withRouter(AppLoggedIn);
