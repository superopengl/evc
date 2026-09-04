import React from 'react';
import { withRouter } from 'util/withRouter';
import ProfileForm from './ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

const ProfileModal = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const { visible, onOk, closable = true } = props;

  const handlePostSave = (updatedUser) => {
    setUser(updatedUser);
    onOk();
  }


  return (
    <Modal
      title="Update Profile"
      closable={closable}
      destroyOnHidden={true}
      footer={null}
      open={visible}
      onOk={onOk}
      {...props} mask={{ closable: closable }}>
      <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)} />
    </Modal>
  );
};

ProfileModal.propTypes = {
  closable: PropTypes.bool
};

export default withRouter(ProfileModal);
