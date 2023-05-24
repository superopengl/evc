
import React from 'react';
import { DatePicker, Typography, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { SaveOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';

const {Text} = Typography;
const { RangePicker } = DatePicker;

function convertToMoments(value) {
  if (!value) return value;
  return Array.isArray(value) ? value.map(x => moment(x)) : moment(value);
}

export const NumberRangeDisplay = (props) => {
  const {  showTime, value } = props;
  const {lo, hi, createdAt} = value;

  const formatNumber = num => {
    return _.isNumber(num) ? <MoneyAmount value={num} /> : '';
  }

  const displayLo = formatNumber(lo);
  const displayHi = formatNumber(hi);

  return <Space size="small" direction="horizontal">
    {showTime && <TimeAgo value={createdAt} accurate={true}/>}
    {
    displayLo && displayHi ? <div><Text>{displayLo}</Text> ~ <Text>{displayHi}</Text></div> :
    <Text>{displayLo || displayHi}</Text>
    }
    
  </Space>
}

NumberRangeDisplay.propTypes = {
  value: PropTypes.object.isRequired,
  showTime: PropTypes.bool,
};

NumberRangeDisplay.defaultProps = {
  showTime: true
};
