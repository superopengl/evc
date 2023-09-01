import React from 'react';
import { withRouter } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 400px;
`;

const ProfilePage = () => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const handlePostSave = (updatedUser) => {
    setUser(updatedUser);
  }

  return (
    <Container>
      <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)} />
    </Container>
  );
};

ProfilePage.propTypes = {};

ProfilePage.defaultProps = {};

export default withRouter(ProfilePage);
