import React from 'react';
import styled from 'styled-components';
import { Typography, Layout } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { notify } from 'util/notify';

const { Title, Paragraph, Link } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem 4rem;
width: 100%;
max-width: 400px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
 margin-bottom: 1rem;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const ProfilePage = props => {
  const context = React.useContext(GlobalContext);
  const {user, setUser} = context;

  const handlePostSave = (updatedUser) => {
    setUser(updatedUser);
  }

  return (
        <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)}/>
  );
};

ProfilePage.propTypes = {};

ProfilePage.defaultProps = {};

export default withRouter(ProfilePage);
