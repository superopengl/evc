import React from 'react';
import styled from 'styled-components';
import { keyframes } from 'styled-components';
import { Typography, Layout, Menu } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileModal from 'pages/Profile/ProfileModal';
import { Route, Switch } from 'react-router-dom';
import MyAccountPage from 'pages/MyAccount/MyAccountPage';
import { DollarCircleFilled, DollarOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';

const { Text } = Typography;

const ContainerStyled = styled.div`
margin: 64px 0 0 0;
width: 100%;
height: 100%;

.ant-pro-sider-layout-side {
  margin-top: 64px;
  height: calc(100vh - 64px) !important;
}

`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const routes = {
  routes: [
    {
      path: '/settings/',
      name: 'Profile',
      icon: <UserOutlined />,
      component: './Welcome',
    },
    {
      path: '/settings/account',
      name: 'Account',
      icon: <DollarOutlined />,
      component: './Welcome',
    },
    {
      path: '/settings/subscription',
      name: 'Subscription',
      icon: <DollarCircleFilled />,
      component: './Welcome',
    },
    {
      path: '/settings/change_password',
      name: 'Change Password',
      icon: <SafetyCertificateOutlined />,
      component: './Welcome',
    },
  ],
}

const ClientSettingsPage = props => {
  const [collapsed, setCollapsed] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { user, setUser, role } = context;
  const { path } = props.match;

  if (!user) {
    return null;
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <ProLayout
          route={routes}
          navTheme="dark"
          menuHeaderRender={false}
          fixSiderbar
          headerRender={false}
          menuItemRender={(item, dom) => (
            <Link to={item.path}>
              {dom}
            </Link>
          )}
        >
          <div style={{display: 'flex', justifyContent: 'center'}}>
          <Switch>
            <Route path={`${path}`} exact component={ProfileModal} />
            <Route path={`${path}/account`} exact component={MyAccountPage} />
            <Route path={`${path}/subscription`} exact component={MyAccountPage} />
          </Switch>

          </div>
        </ProLayout>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientSettingsPage.propTypes = {};

ClientSettingsPage.defaultProps = {};

export default withRouter(ClientSettingsPage);
