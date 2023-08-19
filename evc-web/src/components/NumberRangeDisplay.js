
import React from 'react';
import { DatePicker, Typography, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { SaveOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';
import styled from 'styled-components';
import {DashOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const NumberPanel = styled.div`
  width: 100%;
  // height: 100%;
  // padding: 0;
  // margin: 0;
  // background-color: #f3f3f3;
  // .ant-typography {
  //   color: #000000;
  // }
  font-size: 12px;
`;

export const NumberRangeDisplay = (props) => {
  const { lo, hi, loTrend, hiTrend, time } = props;

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

  return <Space size="small" direction="horizontal">
    {time && <TimeAgo value={time} accurate={true} />}
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
  empty: PropTypes.any,
};

NumberRangeDisplay.defaultProps = {
  lo: null,
  hi: null,
  loTrend: 0,
  hiTrend: 0,
  empty: null
};
