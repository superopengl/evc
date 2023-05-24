
import React from 'react';
import { DatePicker, InputNumber, Space, Button } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { CheckOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { Select } from 'antd';

export const StockEpsInput = (props) => {
  const { onChange, onSave, value: propValue, disabled} = props;
  const [year, setYear] = React.useState(propValue?.year || new Date().getFullYear());
  const [quarter, setQuarter] = React.useState(propValue?.quarter);
  const [value, setValue] = React.useState(propValue?.value);

  const handleChangeValue = v => {
    handleChange(year, quarter, v);
  }

  const handleChangeYear = (y) => {
    handleChange(y, quarter, value);
  }

  const handleChangeQuarter = q => {
    handleChange(year, q, value);
  }

  const handleChange = (y, q, n) => {
    setYear(y);
    setQuarter(q);
    setValue(n);
    onChange({
      year: y,
      quarter: q,
      value: n
    });
  }

  const handleSave = () => {
    onSave({
      year,
      quarter,
      value
    });
    handleChange(null, null, null);
  }

  const isValidValue = () => {
    return _.isNumber(year) &&  _.isNumber(quarter) &&  _.isNumber(value);
  }

  return <Space>
    {/* <DatePicker value={year ? moment(`${year}/7/1`) : null} onChange={handleChangeYear} picker="year" disabled={disabled}/> */}
    <InputNumber value={year} onChange={handleChangeYear} min={1970} max={new Date().getFullYear()} disabled={disabled}/>
    <Select value={quarter} onChange={handleChangeQuarter} disabled={disabled}>
      <Select.Option value={1}>Q1</Select.Option>
      <Select.Option value={2}>Q2</Select.Option>
      <Select.Option value={3}>Q3</Select.Option>
      <Select.Option value={4}>Q4</Select.Option>
    </Select>
    <InputNumber value={value} onChange={handleChangeValue} disabled={disabled}/>
    <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} disabled={disabled || !isValidValue()} />
  </Space>
}

StockEpsInput.propTypes = {
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  value: PropTypes.object,
};

StockEpsInput.defaultProps = {
  value: {},
  onChange: () => { },
  onSave: () => { },
  showSave: true,
  disabled: false
};
