import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Input, Radio, Typography, Checkbox } from 'antd';
import { notify } from 'util/notify';
import { CountrySelector } from 'components/CountrySelector';
import { FileUploader } from 'components/FileUploader';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { Image } from 'antd';
import { InputNumber } from 'antd';
import { createCommissionWithdrawal } from 'services/commissionService';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

const { Text } = Typography;

const PayPalHelpIconButton = () =>
  <Tooltip
    trigger="click"
    overlayClassName="paypal-help-tooltip"
    placement="topRight"
    title={
      <>
        <div><strong>
          <FormattedMessage id="text.paypalScreenshotUploadHowToTitle" />
        </strong></div>
        <FormattedMessage id="text.paypalScreenshotUploadHowToDescription" />
        <Image src="/images/paypal-personal-info.jpg" />
      </>
    }
  >
    <Button type="link" style={{ color: 'black' }} icon={<QuestionCircleFilled />} />
  </Tooltip>


const CommissionWithdrawalForm = (props) => {
  const { onOk } = props;
  const [loading, setLoading] = React.useState(false);
  const intl = useIntl();

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
      <Form.Item label={<FormattedMessage id="text.commissionWithdrawalAmount" />} name="amount" rules={[{
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
      <Form.Item label={<FormattedMessage id="text.givenName" />} name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder={intl.formatMessage({ id: "text.givenName" })} autoComplete="given-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.surname" />} name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder={intl.formatMessage({ id: "text.surname" })} autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.citizenship" />} name="citizenship" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.residenceCountry" />}  name="country" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <CountrySelector />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.address" />} name="address" rules={[{ required: true, whitespace: true, max: 200, message: ' ' }]}>
        <Input placeholder={intl.formatMessage({ id: "text.addressPlaceholder" })} autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.phone" />} name="phone" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder={intl.formatMessage({ id: "text.phonePlaceholder" })} autoComplete="tel" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.identityType" />} name="identityType" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Radio.Group optionType="button" buttonStyle="solid">
          <Radio.Button value="id"><FormattedMessage id="text.identityTypeId" /></Radio.Button>
          <Radio.Button value="passport"><FormattedMessage id="text.identityTypePassport" /></Radio.Button>
          <Radio.Button value="driver"><FormattedMessage id="text.identityTypeDriverLicense" /></Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.identityNumber" />} name="identityNumber" rules={[{ required: true, whitespace: true, max: 50, message: ' ' }]}>
        <Input placeholder={intl.formatMessage({ id: "text.identityNumberPlaceholder" })} autoComplete="address" allowClear={true} maxLength="200" />
      </Form.Item>
      <Form.Item label={<FormattedMessage id="text.paypalAccountEmailAddress" />} name="payPalAccount" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="youremail@easyvaluecheck.com" type="email" autoComplete="email" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item
        label={<><FormattedMessage id="text.paypalProfileInfoScreenshot" /> <PayPalHelpIconButton /></>}
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
        <Checkbox>
          <FormattedMessage id="text.commissionWithdrawalDeclarance" />
        </Checkbox>
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
