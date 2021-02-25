import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteUserTag, listUserTags, saveUserTag } from 'services/userTagService';
import TagManagementPanel from 'components/TagManagementPanel';


const UserTagPage = () => {

  return (
    <TagManagementPanel
      onList={listUserTags}
      onSave={saveUserTag}
      onDelete={deleteUserTag}
    />

  );
};

UserTagPage.propTypes = {};

UserTagPage.defaultProps = {};

export default withRouter(UserTagPage);
