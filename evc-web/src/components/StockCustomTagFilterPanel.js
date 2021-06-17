import React from 'react';
import PropTypes from 'prop-types';
import { CloseOutlined, MinusOutlined, TagFilled, TagOutlined } from '@ant-design/icons';
import { Button, Tag, Row, Col } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import styled from 'styled-components';
import { deleteCustomTag } from 'services/watchListService';

const StyledTag = styled(Tag)`
&:hover {
  cursor: pointer;
}
`;

const StyledCloseButton = styled.span`
font-size: 12px;
color: rgba(0,0,0,0.35);
`;

export const StockCustomTagFilterPanel = (props) => {

  const { onChange, onTagListChange, value } = props;

  const context = React.useContext(GlobalContext);
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

  const handleDeleteTag = async (e, id) => {
    e.stopPropagation();
    await deleteCustomTag(id);
    onTagListChange();
  }

  return (<Row gutter={[5, 5]}>
    {(customTags || [])
      .map((t, i) => <Col key={i}>
        <StyledTag
          color={isSelected(t.id) ? "#55B0D4" : null}
          onClick={() => toggleTag(t.id)}
        >
          {t.name} <StyledCloseButton onClick={e => handleDeleteTag(e, t.id)}>
            <CloseOutlined />
          </StyledCloseButton>
        </StyledTag>
      </Col>)}
  </Row>
  );
};

StockCustomTagFilterPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  onTagListChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};

StockCustomTagFilterPanel.defaultProps = {
  onChange: () => { },
  value: [],
};

