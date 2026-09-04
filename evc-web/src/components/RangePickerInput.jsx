
import React from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// antd 5 pickers take dayjs values, not moment.
function convertToDayjs(value) {
  if (!value) return value;
  return Array.isArray(value) ? value.map(x => dayjs(x)) : dayjs(value);
}

export const RangePickerInput = (props) => {
  const { defaultValue, value } = props;
  return <RangePicker {...props}
    defaultValue={convertToDayjs(defaultValue)}
    value={convertToDayjs(value)}
    onChange={(dates, dateString) => props.onChange(dateString)} />;
}

RangePickerInput.propTypes = {
  // defaultValue: PropTypes.string,
  // value: PropTypes.string
};
