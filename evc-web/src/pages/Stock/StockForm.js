import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Select, Form, Input, Checkbox, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import { signOn } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import PropTypes from 'prop-types';
import { Alert } from 'antd';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
import { CountrySelector } from 'components/CountrySelector';
const { Title } = Typography;


const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  // background-color: #f3f3f3;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const StockForm = (props) => {
  const { stock, onOk } = props;
  const [sending, setSending] = React.useState(false);

  const handleSave = async (values) => {
    if (sending) {
      return;
    }

    try {
      setSending(true);

      await saveProfile(user.id, values);

      notify.success('Successfully saved stock!')
    } finally {
      setSending(false);
    }
  }

  const handleValuesChange = (changedValues, allValues) => {
    
  }

  const isBuiltinAdmin = user.email === 'admin@easyvaluecheck.com';

  return (
    <Form layout="vertical" 
    onFinish={handleSave} 
    onValuesChange={handleValuesChange}
    style={{ textAlign: 'left' }} 
    initialValues={stock}>
      <Form.Item label="Symbol" name="symbol" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Stock symbol" allowClear={true} maxLength="100" autoFocus={isBuiltinAdmin} />
      </Form.Item>
      <Form.Item label="Company Name" name="company" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Company name" autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Market" name="market" rules={[{ required: false, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="market" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="PE Low" name="peLo" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE low" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="PE High" name="peHi" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE high" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Value" name="value" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="Value" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Support Price Low" name="supportPriceLo" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE low" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Support Price High" name="supportPriceHi" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE high" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Pressure Price Low" name="pressurePriceLo" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE low" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Pressure Price High" name="pressurePriceHi" rules={[{ required: true, type: 'number', whitespace: true, max: 20, message: ' ' }]}>
        <Input placeholder="PE high" allowClear={true} maxLength="20" pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item style={{ marginTop: '1rem' }}>
        <Button block type="primary" htmlType="submit" disabled={sending}>Save</Button>
      </Form.Item>
    </Form>
  );
}

StockForm.propTypes = {
  stock: PropTypes.object;
};

StockForm.defaultProps = {
};

export default withRouter(StockForm);
