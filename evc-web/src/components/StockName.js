import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


export const StockName = (props) => {

  const { value, ...other } = props;

 const {symbol, company} = value;

  return (
  <Text {...other}>{symbol} <Text type="secondary"><small>({company})</small></Text></Text>
  );
};

StockName.propTypes = {
  value: PropTypes.object.isRequired,
};

StockName.defaultProps = {
}