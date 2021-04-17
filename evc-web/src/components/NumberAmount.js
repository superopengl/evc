import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


const MoneyAmount = (props) => {

  const { value, postfix, digital, ...other } = props;

  const isGreen = value >= 0;
  return (
    <Text type={isGreen ? 'success' : 'danger'} {...other}>
      {isGreen ? '+' : ''}{(+value || 0).toFixed(digital)}{postfix ? ` ${postfix}`: ''}
    </Text>
  );
};

MoneyAmount.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  postfix: PropTypes.string,
  digital: PropTypes.number,
};

MoneyAmount.defaultProps = {
  value: 0,
  postfix: '',
  digital: 2
};

export default MoneyAmount;
