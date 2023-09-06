import React from 'react';
import { withRouter } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Modal } from 'antd';

const ProfileModal = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const handlePostSave = (updatedUser) => {
    setUser(updatedUser);
  }

  return (
    <Modal
      title="Update Profile"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      {...props}>
      <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)} />
    </Modal>
  );
};

ProfileModal.propTypes = {};

ProfileModal.defaultProps = {};

export default withRouter(ProfileModal);
