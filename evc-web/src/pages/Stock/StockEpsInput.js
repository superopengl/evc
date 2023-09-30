
import React from 'react';
import { DatePicker, InputNumber, Space, Button, Form } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import { CheckOutlined } from '@ant-design/icons';
import * as _ from 'lodash';
import { Select } from 'antd';

export const StockEpsInput = (props) => {
  const { onChange, onSave, disabled } = props;

  const handleSave = (values) => {
    onSave(values);
  }

  return <Space>
    {/* <DatePicker value={year ? moment(`${year}/7/1`) : null} onChange={handleChangeYear} picker="year" disabled={disabled}/> */}
    {/* <InputNumber value={year} onChange={handleChangeYear} min={1970} max={new Date().getFullYear()} disabled={disabled}/>
    <Select value={quarter} onChange={handleChangeQuarter} disabled={disabled} style={{minWidth: '4rem'}}>
      <Select.Option value={1}>Q1</Select.Option>
      <Select.Option value={2}>Q2</Select.Option>
      <Select.Option value={3}>Q3</Select.Option>
      <Select.Option value={4}>Q4</Select.Option>
    </Select> */}
    <Form layout="inline" onFinish={handleSave}>
      <Form.Item label="" name="period" rules={[{ required: true, message: ' ' }]}>
        <DatePicker placeholder="Report quarter" picker="quarter" disabled={disabled} style={{width: 150}} />
      </Form.Item>
      <Form.Item label="" name="value" rules={[{ required: true, message : ' ' }]}>
        <InputNumber disabled={disabled} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<CheckOutlined />} disabled={disabled} />
      </Form.Item>
    </Form>
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
