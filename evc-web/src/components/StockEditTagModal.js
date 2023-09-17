import React from 'react';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import TagSelect from 'components/TagSelect';


const StockEditTagModal = props => {
  const { visible, value, tags, onOk, onCancel } = props;

  const [changedValue, setChangedValue] = React.useState(value);
  const [modalVisible, setModalVisible] = React.useState(visible);

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  return (
    <Modal
      title="Edit Stock Tags"
      visible={modalVisible}
      destroyOnClose={true}
      onOk={() => onOk(changedValue)}
      onCancel={onCancel}
      closable={true}
      maskClosable={false}
      okText="Save"
    >
      <TagSelect value={value} tags={tags} onChange={setChangedValue} readonly={false} />
    </Modal>
  );
}

StockEditTagModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  value: PropTypes.array,
  tags: PropTypes.array.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

StockEditTagModal.defaultProps = {
  visible: false,
};

export default withRouter(StockEditTagModal);
