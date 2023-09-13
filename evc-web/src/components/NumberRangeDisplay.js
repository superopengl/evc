
import React from 'react';
import { DatePicker, Typography, Space } from 'antd';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import styled from 'styled-components';

const { Text } = Typography;

const NumberPanel = styled.div`
  width: 100%;
`;

export const NumberRangeDisplay = (props) => {
  const { lo, hi, loTrend, hiTrend, time, accurateTime, className } = props;

  if (!lo && lo !== 0 && !hi && hi !== 0) {
    return props.empty;
  }

  const formatNumber = num => {
    return _.isNumber(+num) ? +num : null;
  }

  const getTextPropsByTrend = (trend) => {
    return trend === 1 ? { type: 'success' } :
      trend === -1 ? { type: 'danger' } :
        {};
  }

  const getComponent = (number, trend) => {
    const textProps = {...getTextPropsByTrend(trend)}
    return <Text {...textProps}>{number.toFixed(2)} {trend === 1 ? '↑' : trend === -1 ? '↓' : null}</Text>
  }

  const displayLo = formatNumber(lo);
  const displayHi = formatNumber(hi);

  const isCompactMode = displayLo === displayHi && loTrend === hiTrend;

  return <Space size="small" direction="horizontal" className={className}>
    {time && <TimeAgo value={time} accurate={accurateTime} showAgo={false} />}
    <NumberPanel>
      {displayLo === null && displayHi === null ? <Text>None</Text> :
        isCompactMode ? getComponent(displayLo, loTrend) :
          <>{getComponent(displayLo, loTrend)} ~ {getComponent(displayHi, hiTrend)}</>
      }
    </NumberPanel>

  </Space>
}

NumberRangeDisplay.propTypes = {
  lo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hi: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  loTrend: PropTypes.oneOf([-1, 0, 1]),
  hiTrend: PropTypes.oneOf([-1, 0, 1]),
  time: PropTypes.any,
  accurateTime: PropTypes.bool,
  empty: PropTypes.any,
};

NumberRangeDisplay.defaultProps = {
  lo: null,
  hi: null,
  loTrend: 0,
  hiTrend: 0,
  empty: null,
  accurateTime: true,
};
