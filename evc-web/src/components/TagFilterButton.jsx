import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Modal } from 'antd';
import { TagFilter } from 'components/TagFilter';
import { FormattedMessage } from 'react-intl';

export const TagFilterButton = (props) => {

  const { tags = [], group = false, value = [], onChange = () => { } } = props;
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
        <Button onClick={() => setVisible(true)}>
          <FormattedMessage id="text.filter" />
        </Button>
      </Badge>
      <Modal
        title={<FormattedMessage id="text.filterByTags" />}
        confirmLoading={loading}
        open={visible}
        closable
        maskClosable
        destroyOnHidden={true}
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

export default TagFilterButton;
