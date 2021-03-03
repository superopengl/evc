import React from 'react';
import styled from 'styled-components';
import {keyframes} from 'styled-components';
import { Typography, Layout, Menu } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfilePage from 'pages/Profile/ProfilePage';
import { Route, Switch } from 'react-router-dom';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import MyAccountPage from 'pages/MyAccount/MyAccountPage';
import MySubscriptionPage from 'pages/MySubscription/MySubscriptionPage';
import { DollarCircleFilled, DollarOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ContainerStyled = styled.div`
margin: 64px 0 0 0;
width: 100%;
height: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const slide = keyframes`
from {
  margin-left: 80px;

}

to {
  margin-left: 200px;
}
`;

const StyledLayoutContent = styled(Layout.Content)`
padding: 20px;
animation-name: ${slide}
animation-duration: 0.4s;
animation-iteration-count: 10;
// animation-timing-function: linear;
// animation-fill-mode: forwards;

&.collapsed {
  // animation-direction: reverse;
}

&.expand {
  // animation-direction: normal;
}
`;


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
        <Layout style={{ height: '100%' }}>
          <Layout.Sider collapsible collapsed={collapsed} theme="dark" onCollapse={c => setCollapsed(c)}
            style={{
              paddingTop: 20,
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
            }}>
            <Menu theme="dark">
              <Menu.Item key="profile" icon={<UserOutlined />}><Link to={`${path}`}>Profile</Link></Menu.Item>
              <Menu.Item key="account" icon={<DollarOutlined />}><Link to={`${path}/account`}>Account</Link></Menu.Item>
              <Menu.Item key="subscription" icon={<DollarCircleFilled />}><Link to={`${path}/subscription`}>Subscription</Link></Menu.Item>
              <Menu.Item key="change_password" icon={<SafetyCertificateOutlined />}><Link to={`${path}/change_password`}>Change Password</Link></Menu.Item>
            </Menu>
          </Layout.Sider>
          <StyledLayoutContent className={collapsed ? 'collapsed' : 'expand'}>
            <Switch>
              <Route path={`${path}`} exact component={ProfilePage} />
              <Route path={`${path}/account`} exact component={MyAccountPage} />
              <Route path={`${path}/subscription`} exact component={MySubscriptionPage} />
              <Route path={`${path}/change_password`} exact component={ChangePasswordPage} />
            </Switch>
          </StyledLayoutContent>
        </Layout>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientSettingsPage.propTypes = {};

ClientSettingsPage.defaultProps = {};

export default withRouter(ClientSettingsPage);
