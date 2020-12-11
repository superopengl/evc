import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


export const StockName = (props) => {

  const { value, size, style, ...other } = props;

 const {symbol, company} = value;

  return (
  <Text {...other} style={{fontSize: size}}>{symbol} <Text type="secondary" style={{fontSize: size}}>({company})</Text></Text>
  );
};

StockName.propTypes = {
  value: PropTypes.object.isRequired,
  size: PropTypes.any,
};

StockName.defaultProps = {
}