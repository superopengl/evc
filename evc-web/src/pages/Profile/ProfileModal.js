import React from 'react';
import { withRouter } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

const ProfileModal = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const { visible, onOk, closable } = props;

  const handlePostSave = (updatedUser) => {
    setUser(updatedUser);
    onOk();
  }


  return (
    <Modal
      title="Update Profile"
      closable={closable}
      maskClosable={closable}
      destroyOnClose={true}
      footer={null}
      visible={visible}
      onOk={onOk}
      {...props}>
      <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)} />
    </Modal>
  );
};

ProfileModal.propTypes = {
  closable: PropTypes.bool
};

ProfileModal.defaultProps = {
  closable: true
};

export default withRouter(ProfileModal);
