import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space } from 'antd';

const { Text } = Typography;


export const StockName = (props) => {

  const { value, size, style, direction, ...other } = props;

 const {symbol, company} = value;

  return (
  <Space direction={direction} {...other} size="small" style={{fontSize: size}}>
    <Text strong>{symbol}</Text>
    <Text type="secondary" style={{fontSize: size, fontWeight: 300}}>({company})</Text>
  </Space>
  );
};

StockName.propTypes = {
  value: PropTypes.object.isRequired,
  size: PropTypes.number,
  direction: PropTypes.oneOf(['vertical', 'horizontal'])
};

StockName.defaultProps = {
  // size: 14,
  direction: 'horizontal'
}