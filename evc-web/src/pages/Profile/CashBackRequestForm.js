import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Radio } from 'antd';
import PropTypes from 'prop-types';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
import { CountrySelector } from 'components/CountrySelector';
import { FileUploader } from 'components/FileUploader';

const CashBackRequestForm = (props) => {
  const { onOk } = props;
  const [loading, setLoading] = React.useState(false);
  const [request, setRequest] = React.useState({files: []});

  const handleSave = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      // await createCashBackRequest(values);

      notify.success('Successfully saved profile!')

      onOk();
    } finally {
      setLoading(false);
    }
  }

  const handleUploadingChange = uploading => {
    setLoading(uploading);
  }

  const handleRemove = (fileId) => {
    request.files = request.files.filter(d => d.fileId !== fileId);
  }

  const handleAdd = (fileId) => {
    request.files = [...request.files, { fileId, isByClient: true }];
  }

  return (
    <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }} initialValues={request}>
      <Form.Item label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Given name" autoComplete="given-name" allowClear={true} maxLength="100" autoFocus />
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
      <Form.Item label="Type of Identity" name="identityType" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Radio.Group optionType="button" buttonStyle="solid">
          <Radio.Button value="id">ID</Radio.Button>
          <Radio.Button value="passport">Passport</Radio.Button>
          <Radio.Button value="driver">Driver license</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Identity Number" name="identityNumber" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <Input placeholder="ID / passport / driver license number" autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label="PayPal Account (email that you use for PayPal)" name="payPalAccount" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Screenshots of PayPal personal information" name="files" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}
        extra="Must be consistent with the name in the identity. Up to 3 photos."
      >
        <FileUploader
          onRemove={handleRemove}
          onAdd={handleAdd}
          onUploadingChange={handleUploadingChange}
        />
      </Form.Item>
      <Form.Item style={{ marginTop: '1rem' }}>
        <Button block type="primary" htmlType="submit" disabled={loading}>Submit</Button>
      </Form.Item>
    </Form>
  );
}

CashBackRequestForm.propTypes = {
  user: PropTypes.any.isRequired,
  initial: PropTypes.bool
};

CashBackRequestForm.defaultProps = {
  initial: false
};

export default withRouter(CashBackRequestForm);
