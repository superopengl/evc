import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Modal } from 'antd';
import { TagFilter } from 'components/TagFilter';

export const TagFilterButton = (props) => {

  const { tags, group, value, onChange } = props;
  const [visible, setVisible] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState(value || []);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(false);
  }, [visible]);

  const handleOk = async () => {
    setLoading(true);
    await onChange(selectedTags);
    setVisible(false);
  }

  const handleChangeTags = (changedTags) => {
    setSelectedTags(changedTags);
  }

  const handleCancel = () => {
    setVisible(false);
    setSelectedTags(value);
  }

  return (
    <>
      <Badge count={selectedTags.length} showZero={false} style={{ backgroundColor: "#57BB60" }}>
        <Button onClick={() => setVisible(true)}>Tags Filter</Button>
      </Badge>
      <Modal
        title="Fitler stocks by tags"
        confirmLoading={loading}
        visible={visible}
        closable
        maskClosable
        destroyOnClose={true}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <TagFilter value={selectedTags} tags={tags} group={group} onChange={handleChangeTags} />
      </Modal>
    </>
  );
};

TagFilterButton.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.object),
  group: PropTypes.bool,
};

TagFilterButton.defaultProps = {
  value: [],
  tags: [],
  onChange: () => { },
  group: false
};

export default TagFilterButton;
