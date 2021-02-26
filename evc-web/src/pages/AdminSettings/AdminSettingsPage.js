import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfilePage from 'pages/Profile/ProfilePage';
import { Route, Switch } from 'react-router-dom';
import ChangePasswordPage from 'pages/ChangePasswordPage';
import UserTagPage from 'pages/UserTag/UserTagPage';
import StockTagPage from 'pages/StockTag/StockTagPage';

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


const AdminSettingsPage = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser, role } = context;
  const { path } = props.match;
  if (role !== 'admin') {
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
              <Menu.Item key="stocktag"><Link to={`${path}/stocktag`}>Stock Tags</Link></Menu.Item>
              <Menu.Item key="usertag"><Link to={`${path}/usertag`}>User Tags</Link></Menu.Item>
              <Menu.Item key="change_password"><Link to={`${path}/change_password`}>Change Password</Link></Menu.Item>
            </Menu>
          </Layout.Sider>
          <Layout.Content style={{padding: 20}}>
            <Switch>
              <Route path={`${path}`} exact component={ProfilePage} />
              <Route path={`${path}/stocktag`} exact component={StockTagPage} />
              <Route path={`${path}/usertag`} exact component={UserTagPage} />
              <Route path={`${path}/change_password`} exact component={ChangePasswordPage} />
            </Switch>
          </Layout.Content>
        </Layout>
      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminSettingsPage.propTypes = {};

AdminSettingsPage.defaultProps = {};

export default withRouter(AdminSettingsPage);
