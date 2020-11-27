
import React from 'react';
import { DatePicker, Typography, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { SaveOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { TimeAgo } from './TimeAgo';
import MoneyAmount from './MoneyAmount';
import styled from 'styled-components';

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
`;

export const NumberRangeDisplay = (props) => {
  const { lo, hi, time } = props;

  if(!lo && lo !== 0 && !hi && hi !== 0) {
    return <Text>None</Text>
  }

  const formatNumber = num => {
    return _.isNumber(+num) ? <MoneyAmount value={+num} showSymbol={false} /> : '';
  }

  const displayLo = formatNumber(lo);
  const displayHi = formatNumber(hi);

  return <Space size="small" direction="horizontal">
    {time && <TimeAgo value={time} accurate={true} />}
    <NumberPanel>
      {
        displayLo && displayHi && lo !== hi ? <><Text>{displayLo}</Text> ~ <Text>{displayHi}</Text></> :
          displayLo || displayHi ? <Text>{displayLo || displayHi}</Text> : <Text>None</Text>
      }
    </NumberPanel>

  </Space>
}

NumberRangeDisplay.propTypes = {
  lo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  hi: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  time: PropTypes.any,
};

NumberRangeDisplay.defaultProps = {
  lo: null,
  hi: null,
};
