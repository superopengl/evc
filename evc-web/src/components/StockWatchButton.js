import React from 'react';
import PropTypes from 'prop-types';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
export const StockWatchButton = (props) => {

  const { onChange, value, size } = props;

  const style = {
    fontSize: size,
    color: value ? '#fadb14' : '#d9d9d9',
  };

  const handleToggleValue = e => {
    e.stopPropagation();
    onChange(!value);
  }

  return (
    value ?
      <Tooltip title="Click to unwatch this stock">
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

StockWatchButton.defaultProps = {
  onChange: () => { },
  value: false,
  size: 18,
};

