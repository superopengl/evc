import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Menu, Space } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileModal from 'pages/Profile/ProfileModal';
import { Route, Switch } from 'react-router-dom';
import UserTagPage from 'pages/UserTag/UserTagPage';
import StockTagPage from 'pages/StockTag/StockTagPage';

const { Text } = Typography;

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
        <div style={{ marginLeft: 16, marginBottom: 24, fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'baseline' }}>
          Account: <pre style={{display: 'inline-block', margin: '0 0 0 4px'}}>{user.profile.email}</pre>
        </div>
        <Layout>
          <Layout.Sider theme="light" collapsible={false}>
            <Menu>
              <Menu.Item key="profile"><Link to={`${path}`}>Profile</Link></Menu.Item>
              <Menu.Item key="stocktag"><Link to={`${path}/stocktag`}>Stock Tags</Link></Menu.Item>
              <Menu.Item key="usertag"><Link to={`${path}/usertag`}>User Tags</Link></Menu.Item>
            </Menu>
          </Layout.Sider>
          <Layout.Content style={{ padding: 20 }}>
            <Switch>
              <Route path={`${path}`} exact component={ProfileModal} />
              <Route path={`${path}/stocktag`} exact component={StockTagPage} />
              <Route path={`${path}/usertag`} exact component={UserTagPage} />
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
