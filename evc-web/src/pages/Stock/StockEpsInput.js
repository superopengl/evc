
import React from 'react';
import { DatePicker, InputNumber, Space, Button, Form } from 'antd';
import PropTypes from 'prop-types';
import { CheckOutlined } from '@ant-design/icons';

export const StockEpsInput = (props) => {
  const { onSave, disabled } = props;

  const handleSave = (values) => {
    onSave(values);
  }

  return <Space size="small">
    <Form layout="inline" onFinish={handleSave}>
      <Form.Item label="" name="period" rules={[{ required: true, message: ' ' }]}>
        <DatePicker placeholder="Report date" picker="date" disabled={disabled} style={{ width: 150 }} />
      </Form.Item>
      <Form.Item label="" name="value" rules={[{ required: true, message: ' ' }]}>
        <InputNumber disabled={disabled} />
      </Form.Item>
      <Button type="primary" htmlType="submit" icon={<CheckOutlined />} disabled={disabled} />
    </Form>
  </Space>
}

StockEpsInput.propTypes = {
  onSave: PropTypes.func,
  value: PropTypes.object,
};

StockEpsInput.defaultProps = {
  value: {},
  onSave: () => { },
  disabled: false
};
