
import React from 'react';
import { Typography, Space, Skeleton } from 'antd';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import styled from 'styled-components';

const { Text } = Typography;

const NumberPanel = styled.div`
  width: 100%;
`;

export const NumberValueDisplay = (props) => {
  const { value, className, loading, fixedDecimal } = props;
  const isSingleValue = !Array.isArray(value);
  const [lo, hi] = isSingleValue ? [] : value;

  if ((isSingleValue && !value) || (!isSingleValue && (!lo || !hi))) {
    return <small>{props.empty}</small>;
  }

  const formatNumber = num => {
    return isNumber(+num) ? +num : null;
  }

  const getComponent = (number) => {
    return <Text>{number.toFixed(fixedDecimal)}</Text>
  }

  const displayValue = formatNumber(value);
  const displayLo = formatNumber(lo);
  const displayHi = formatNumber(hi);
  const isMinus = isSingleValue ? displayValue < 0 : displayLo < 0;


  return <Space size="small" direction="horizontal" className={className}>
    {
      loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> :
        <NumberPanel>
          {isMinus && props.minus ? <small>{props.minus}</small> :
            isSingleValue ? getComponent(displayValue) :
              <>{getComponent(displayLo)} ~ {getComponent(displayHi)}</>
          }
        </NumberPanel>
    }

  </Space>
}

NumberValueDisplay.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]).isRequired,
  fixedDecimal: PropTypes.number,
  empty: PropTypes.any,
  minus: PropTypes.any,
  loading: PropTypes.bool,
};

NumberValueDisplay.defaultProps = {
  empty: <Text type="warning">NONE</Text>,
  fixedDecimal: 2,
  minus: null,
  loading: false,
};
