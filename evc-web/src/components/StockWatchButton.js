import React from 'react';
import PropTypes from 'prop-types';
import { StarOutlined, StarFilled } from '@ant-design/icons';

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
      <StarFilled style={style} onClick={handleToggleValue} /> :
      <StarOutlined style={style} onClick={handleToggleValue} />
  );
};

StockWatchButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
  size: PropTypes.number,
};

StockWatchButton.defaultProps = {
  onChange: () => {},
  value: false,
  size: 18,
};

