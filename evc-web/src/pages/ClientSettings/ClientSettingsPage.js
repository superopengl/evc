import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfilePage from 'pages/Profile/ProfilePage';
import { Route, Switch } from 'react-router-dom';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import MyAccountPage from 'pages/MyAccount/MyAccountPage';
import MySubscriptionPage from 'pages/MySubscription/MySubscriptionPage';

const {Text} = Typography;

const ContainerStyled = styled.div`
margin: 6rem 0 2rem 0;
width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const ClientSettingsPage = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser, role } = context;
  const { path } = props.match;
  if (role !== 'client') {
    return null;
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Layout>
          <Layout.Sider theme="light" collapsible={false}>
            <Menu>
            <Menu.Item key="email" disabled={true}>
                <Text code>{user.profile.email}</Text>
              </Menu.Item>
              <Menu.Item key="profile"><Link to={`${path}`}>Profile</Link></Menu.Item>
              <Menu.Item key="account"><Link to={`${path}/account`}>Account</Link></Menu.Item>
              <Menu.Item key="subscription"><Link to={`${path}/subscription`}>Subscription</Link></Menu.Item>
              <Menu.Item key="change_password"><Link to={`${path}/change_password`}>Change Password</Link></Menu.Item>
            </Menu>
          </Layout.Sider>
          <Layout.Content style={{padding: 20}}>
            <Switch>
              <Route path={`${path}`} exact component={ProfilePage} />
              <Route path={`${path}/account`} exact component={MyAccountPage} />
              <Route path={`${path}/subscription`} exact component={MySubscriptionPage} />
              <Route path={`${path}/change_password`} exact component={ChangePasswordPage} />
            </Switch>
          </Layout.Content>
        </Layout>
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientSettingsPage.propTypes = {};

ClientSettingsPage.defaultProps = {};

export default withRouter(ClientSettingsPage);
