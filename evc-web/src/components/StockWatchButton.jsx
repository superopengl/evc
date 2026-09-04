import React from 'react';
import PropTypes from 'prop-types';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';

export const StockWatchButton = (props) => {

  const { onChange = () => { }, value = false, size = 18 } = props;

  const style = {
    fontSize: size,
    color: value ? '#fadb14' : '#8c8c8c',
  };

  const handleToggleValue = e => {
    e.stopPropagation();
    onChange(!value);
    if(value) {

    }
  }

  return (
    value ?
      <Tooltip title="Click to unwatch">
        <StarFilled style={style} onClick={handleToggleValue} />
      </Tooltip> :
      <Tooltip title="Click to add to my watchlist">
        <StarOutlined style={style} onClick={handleToggleValue} />
      </Tooltip>
  );
};

StockWatchButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  size: PropTypes.number,
};

