import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space } from 'antd';

const { Text } = Typography;


export const StockName = (props) => {

  const { value, size, style, direction, ...other } = props;

 const {symbol, company} = value;

  return (
  <Space direction={direction} {...other} size="small" style={{fontSize: size}}>
    <Text style={{ color: '#3273A4' }} strong>{symbol}</Text>
    <Text type="secondary" style={{fontSize: size}}><small>({company})</small></Text>
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