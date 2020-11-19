import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


const MoneyAmount = (props) => {

  const { value, ...other } = props;

  const [] = React.useState(value);

  return (
    <Text {...other}>
      <sup><small>$</small></sup> {(+value || 0).toFixed(2)}
    </Text>
  );
};

MoneyAmount.propTypes = {
  value: PropTypes.number.isRequired,
};

MoneyAmount.defaultProps = {
  value: 0
};

export default MoneyAmount;
