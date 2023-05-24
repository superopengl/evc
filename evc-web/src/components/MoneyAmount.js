import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


const MoneyAmount = (props) => {

  const { value, showSymbol, ...other } = props;

  const [] = React.useState(value);

  return (
    <Text {...other}>
      {showSymbol ? `$ `: ''}{(+value || 0).toFixed(2)}
    </Text>
  );
};

MoneyAmount.propTypes = {
  value: PropTypes.number.isRequired,
  showSymbol: PropTypes.bool
};

MoneyAmount.defaultProps = {
  value: 0,
  showSymbol: true
};

export default MoneyAmount;
