import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout, Space, Modal } from 'antd';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { login } from 'services/authService';
import { countUnreadMessage } from 'services/messageService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { createStock, existsStock } from 'services/stockService';
import PropTypes from 'prop-types';

const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const CreateStockModal = props => {
  const { visible, onOk, onCancel } = props;
  const [sending, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible])


  const validateExsitsSymbol = async (rule, symbol) => {
    if (!symbol) {
      throw new Error(`Please input stock symbol`);
    }
    try {
      setLoading(true);
      const exists = await existsStock(symbol);
      if (exists) {
        throw new Error(`Stock ${symbol} has already exists`);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);
      await createStock(values);
      onOk();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Create Stock"
      visible={modalVisible}
      closable={true}
      maskClosable={false}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
        <Form.Item label="Symbol" name="symbol"
          rules={[{ required: true, validator: validateExsitsSymbol, whitespace: true, max: 10 }]}
        >
          <Input placeholder="AAPL" allowClear={true} maxLength="10" disabled={sending} autoFocus={true} />
        </Form.Item>
        <Form.Item label="Company Name" name="company" rules={[{ required: true, max: 100, message: 'Please input company name' }]}>
          <Input placeholder="Apple Inc." maxLength="100" disabled={sending} />
        </Form.Item>
        <Form.Item>
          <Space style={{width: '100%', justifyContent: 'flex-end'}}>
            <Button block onClick={onCancel}>Cancel</Button>
            <Button block type="primary" htmlType="submit" disabled={sending}>Create Stock</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

CreateStockModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

CreateStockModal.defaultProps = {};

export default withRouter(CreateStockModal);
