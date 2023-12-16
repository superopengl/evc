import React from 'react';
import PropTypes from 'prop-types';
import { TagFilled, TagOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const StockCustomTagButton = (props) => {

  const { onChange, value, size } = props;

  const style = {
    fontSize: size,
    color: value ?  '#8c8c8c' : '#fadb14',
  };

  const handleToggleValue = e => {
    e.stopPropagation();
    onChange(!value);
    if (value) {

    }
  }

  return (
    value ?
      <Tooltip title="Click to exit editing">
        <TagOutlined style={style} onClick={handleToggleValue} />
      </Tooltip> :
      <Tooltip title="Click to edit tags">
        <TagFilled style={style} onClick={handleToggleValue} />
      </Tooltip>
  );
};

StockCustomTagButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  size: PropTypes.number,
};

StockCustomTagButton.defaultProps = {
  onChange: () => { },
  value: false,
  size: 18,
};

