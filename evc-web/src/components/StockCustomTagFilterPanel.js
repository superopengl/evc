import React from 'react';
import PropTypes from 'prop-types';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Tag, Row, Col, Modal, Input } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import styled from 'styled-components';
import { createCustomTag, deleteCustomTag } from 'services/watchListService';
import { notify } from 'util/notify';

const StyledTag = styled(Tag)`
&:hover {
  cursor: pointer;
}
`;

const StyledCloseButton = styled.span`
font-size: 12px;
color: rgba(0,0,0,0.35);
`;

const StyledNewTagInput = styled(Input.Search)`
input {
  font-size: 12px;
}
`;

export const StockCustomTagFilterPanel = (props) => {

  const { onChange, onDeleteTag, onAddTag, value } = props;

  const context = React.useContext(GlobalContext);
  const [tagName, setTagName] = React.useState('');
  const { customTags } = context;

  const isSelected = (tagId) => {
    return (value || []).includes(tagId);
  }

  const toggleTag = (tagId) => {
    const index = value.indexOf(tagId);
    if (index === -1) {
      onChange([...value, tagId]);
    } else {
      onChange(value.filter(x => x !== tagId));
    }
  };

  const handleDeleteTag = async (e, tag) => {
    e.stopPropagation();
    Modal.confirm({
      title: <>Delete tag <Tag>{tag.name}</Tag>?</>,
      content: `Deleting will remove this tag from all the stocks, which are being tagged right now.`,
      maskClosable: true,
      onOk: async () => {
        await deleteCustomTag(tag.id);
        onDeleteTag(tag.id);
      },
      okText: 'Delete it',
      okButtonProps: {
        danger: true
      }
    });
  }

  const handleCreateTag = async (value, e) => {
    e.stopPropagation();
    if (value) {
      await createCustomTag(value);
      onAddTag();
      setTagName('');
      notify.success(<>Successfully saved tag <strong>{value}</strong>.</>);
    }
  }

  return (<Row gutter={[5, 5]}>
    {(customTags || [])
      .map((t, i) => <Col key={i}>
        <StyledTag
          color={isSelected(t.id) ? "#55B0D4" : null}
          onClick={() => toggleTag(t.id)}
        >
          {t.name} <StyledCloseButton onClick={e => handleDeleteTag(e, t)}>
            <CloseOutlined style={{ marginLeft: 4 }} />
          </StyledCloseButton>
        </StyledTag>
      </Col>)}
    <Col>
      <div style={{ display: 'flex' }}>
        <StyledNewTagInput placeholder="Create tag"
          size="small"
          maxLength={16}
          allowClear
          value={tagName}
          onChange={e => setTagName(e.target.value)}
          enterButton={<Button type="primary" icon={<CheckOutlined />}></Button>}
          onSearch={handleCreateTag}
        />
      </div>
    </Col>
  </Row>
  );
};

StockCustomTagFilterPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  onDeleteTag: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};

StockCustomTagFilterPanel.defaultProps = {
  onChange: () => { },
  value: [],
};

