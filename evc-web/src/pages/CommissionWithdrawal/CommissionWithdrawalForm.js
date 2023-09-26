import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Radio, Typography, Checkbox } from 'antd';
import { notify } from 'util/notify';
import { CountrySelector } from 'components/CountrySelector';
import { FileUploader } from 'components/FileUploader';
import { QuestionCircleFilled, SettingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Image } from 'antd';
import { InputNumber } from 'antd';
import { createCommissionWithdrawal } from 'services/commissionService';

const { Text } = Typography;

const PayPalHelpIconButton = () =>
  <Tooltip
    trigger="click"
    overlayClassName="paypal-help-tooltip"
    placement="topRight"
    title={
      <>
        <div><strong>How to find PayPal Personal Information?</strong></div>
        Find and click the setting menu (<SettingOutlined /> icon) on your PayPal homepage. Go to Account {'>'} Profile. You should be able to see a page like below.
        <Image src="/images/paypal-personal-info.jpg" />
      </>
    }
  >
    <Button type="link" style={{ color: 'black' }} icon={<QuestionCircleFilled />} />
  </Tooltip>


const CommissionWithdrawalForm = (props) => {
  const { onOk } = props;
  const [loading, setLoading] = React.useState(false);

  const handleSave = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const newId = await createCommissionWithdrawal(values);

      notify.success(<>Successfully submitted the commission withdrawal application (<Text code>{newId}</Text>). We will notify you by email if this application is handled.</>)

      onOk();
    } finally {
      setLoading(false);
    }
  }

  const handleUploadingChange = uploading => {
    setLoading(uploading);
  }

  return (
    <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }}>
      <Form.Item label="Amount (USD $)" name="amount" rules={[{
        validator: (_, value) =>
          value > 0 ? Promise.resolve() : Promise.reject(' '),
      }]}>
        <InputNumber
          autoFocus
          min={1}
          max={1000}
          step={10}
        // formatter={value => `USD$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        // parser={value => value.replace(/USD\$\s?|(,*)/g, '')}
        />
      </Form.Item>
      <Form.Item label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Given name" autoComplete="given-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Surname" autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Citizenship" name="citizenship" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector />
      </Form.Item>
      <Form.Item label="Residence country (the country that you reside most of the time)" name="country" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector />
      </Form.Item>
      <Form.Item label="Address" name="address" rules={[{ required: true, whitespace: true, max: 200, message: ' ' }]}>
        <Input placeholder="Residence address" autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label="Phone" name="phone" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Phone number" autoComplete="tel" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Type of identity" name="identityType" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Radio.Group optionType="button" buttonStyle="solid">
          <Radio.Button value="id">ID</Radio.Button>
          <Radio.Button value="passport">Passport</Radio.Button>
          <Radio.Button value="driver">Driver license</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Identity number" name="identityNumber" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <Input placeholder="ID / passport / driver license number" autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label="PayPal account (email that you use for PayPal)" name="payPalAccount" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item
        label={<>Screenshots of PayPal personal information <PayPalHelpIconButton /></>}
        name="files" rules={[{
          validator: (_, value) => {
            return value?.length > 0 ? Promise.resolve() : Promise.reject('You have to agree to continue.')
          }
        }]}
      >
        <FileUploader onUploadingChange={handleUploadingChange} />
      </Form.Item>
      <Form.Item name="agree" valuePropName="checked" rules={[{
        validator: (_, value) =>
          value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
      }]}>
        <Checkbox>I declare that the information above is provided by myself and true and reliable. I am aware that EVC has the final rights to cancel or refuse the commission withdrawal at any time at its sole discretion upon any false or inconsistent personal information provided above.</Checkbox>
      </Form.Item>
      <Form.Item style={{ marginTop: '1rem' }}>
        <Button block type="primary" htmlType="submit" disabled={loading}>Submit</Button>
      </Form.Item>
    </Form>
  );
}

CommissionWithdrawalForm.propTypes = {
};

CommissionWithdrawalForm.defaultProps = {
};

export default withRouter(CommissionWithdrawalForm);
