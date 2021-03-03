import React from 'react';
import { withRouter } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';

const ProfilePage = () => {
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
