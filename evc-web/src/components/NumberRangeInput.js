
import React from 'react';
import { DatePicker, InputNumber, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { CheckOutlined } from '@ant-design/icons';
import * as _ from 'lodash';

const { RangePicker } = DatePicker;

function convertToMoments(value) {
  if (!value) return value;
  return Array.isArray(value) ? value.map(x => moment(x)) : moment(value);
}

export const NumberRangeInput = (props) => {
  const { onChange, onSave, value, disabled} = props;
  const [lo, setLo] = React.useState(value[0]);
  const [hi, setHi] = React.useState(value[1]);

  const handleChangeLo = newLo => {
    handleChange(newLo, hi);
  }

  const handleChangeHi = newHi => {
    handleChange(lo, newHi);
  }

  const handleChange = (newLo, newHi) => {
    setLo(newLo);
    setHi(newHi);
    onChange([newLo, newHi]);
  }

  const handleSave = () => {
    onSave([lo, hi]);
    handleChange(null, null);
  }

  const isValidValue = () => {
    const isLoNumber = _.isNumber(lo);
    const isHiNumber = _.isNumber(hi);
    if (isLoNumber && isHiNumber) {
      return lo <= hi;
    }
    return isLoNumber || isHiNumber;
  }

  return <Space>
    <InputNumber value={lo} onChange={handleChangeLo} disabled={disabled}/>
    <InputNumber value={hi} onChange={handleChangeHi} disabled={disabled}/>
    <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} disabled={disabled || !isValidValue()} />
  </Space>
}

NumberRangeInput.propTypes = {
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  value: PropTypes.array.isRequired,
  showSave: PropTypes.bool,
  disabled: PropTypes.bool,
};

NumberRangeInput.defaultProps = {
  value: [null, null],
  onChange: () => { },
  onSave: () => { },
  showSave: true,
  disabled: false
};
