
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import dayjs from 'util/dayjs';

// antd 5 replaced dayjs with dayjs internally, so pickers only accept dayjs values.
// customParseFormat is what makes the `format` branch below behave like dayjs(value, format).

export const DateInput = (props) => {
  const {defaultValue, value} = props;

  const getDayjsValue = (value) => {
    if(!value) return value;
    const {format} = props;
    return format ? dayjs(value, format) : dayjs(value);
  }

  return <DatePicker {...props} 
  defaultValue={getDayjsValue(defaultValue)}
  value={getDayjsValue(value)}
  onChange={(date, dateString) => props.onChange(dateString)} />;
}

DateInput.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string
};
