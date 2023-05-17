import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Space, Form, Input, Modal, Layout, InputNumber } from 'antd';
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
import { deleteStock, getStock, saveStock } from 'services/stockService';
import { Loading } from 'components/Loading';
import { StockName } from 'components/StockName';
import { publishEvent } from 'services/eventSevice';
const { Title, Text, Paragraph } = Typography;


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
  const { symbol, onOk } = props;
  const [loading, setLoading] = React.useState(true);
  const [simulatorVisible, setSimulatorVisible] = React.useState(false);
  const [publishingPrice, setPublishingPrice] = React.useState(false);
  const [stock, setStock] = React.useState();

  const loadEntity = async () => {
    if (symbol) {
      const entity = await getStock(symbol);
      setStock(entity);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const handleSave = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      await saveStock(values);

      notify.success('Successfully saved stock!');

      onOk();
    } finally {
      setLoading(false);
    }
  }

  const handleValuesChange = (changedValues, allValues) => {

  }

  const handleCancel = () => {
    props.history.goBack();
  }

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Stock",
      content: <>Do you want delete <Text strong>{stock.company} (stock.symbol)</Text>?</>,
      async onOk() {
        await deleteStock(stock.symbol);
        onOk();
      },
      maskClosable: true,
      okText: 'Yes, Delete!',
      okButtonProps: {
        type: 'danger'
      },
      onCancel() {
      },
    });
  }

  const handlePublishMarketPrice = async (values) => {
    const { price } = values;
    try{
      setPublishingPrice(true);

      const event = {
        type: 'market-price',
        symbol,
        price,
        by: 'simulator'
      };
      await publishEvent(event);
      notify.success(`Publishing market price at $${price}`);

    }finally{
      setPublishingPrice(false);
    }
  }

  if (symbol && !stock) {
    return <Loading />
  }

  return (<>
    <Form
      labelCol={{ span: 10 }}
      wrapperCol={{ span: 14 }}
      layout="horizontal"
      onFinish={handleSave}
      onValuesChange={handleValuesChange}
      style={{ textAlign: 'left' }}
      initialValues={stock}>
      <Form.Item label="Symbol" name="symbol" rules={[{ required: true, whitespace: true, message: ' ' }]}>
        <Input placeholder="Stock symbol" allowClear={true} maxLength="100" autoFocus={true} />
      </Form.Item>
      <Form.Item label="Company Name" name="company" rules={[{ required: true, whitespace: true, message: ' ' }]}>
        <Input placeholder="Company name" autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Market" name="market" rules={[{ required: false, whitespace: true, message: ' ' }]}>
        <Input placeholder="market" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="PE Low" name="peLo" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE low" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="PE High" name="peHi" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE high" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Value" name="value" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="Value" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Support Price Low" name="supportPriceLo" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE low" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Support Price High" name="supportPriceHi" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE high" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Pressure Price Low" name="pressurePriceLo" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE low" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item label="Pressure Price High" name="pressurePriceHi" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
        <InputNumber min={0} placeholder="PE high" allowClear={true} pattern="[0-9.]*" />
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }} style={{ marginTop: '1rem' }}>
        <Space size="middle" direction="vertical" style={{ width: '100%' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
          {stock && <Button block type="primary" htmlType="submit" disabled={loading}>Publish</Button>}
          {stock && <Button block disabled={loading} onClick={() => setSimulatorVisible(true)}>Set Market Price</Button>}
          {stock && <Button block ghost type="danger" disabled={loading} onClick={handleDelete}>Delete</Button>}
          <Button block type="link" onClick={handleCancel}>Cancel</Button>
        </Space>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }} style={{ marginTop: '1rem' }}>
      </Form.Item>
      <Form.Item wrapperCol={{ span: 24 }} style={{ marginTop: '1rem' }}>
      </Form.Item>
    </Form>
    <Modal
      visible={simulatorVisible}
      destroyOnClose={true}
      closable={true}
      maskClosable={false}
      title={<StockName value={stock} />}
      onCancel={() => setSimulatorVisible(false)}
      onOk={() => setSimulatorVisible(false)}
      footer={null}
    >
      <Paragraph type="secondary">Publishing price in here will broadcast to all online clients.</Paragraph>
      <Form
        onFinish={handlePublishMarketPrice}
      >
        <Form.Item label="Market Price" name="price" rules={[{ required: true, type: 'number', whitespace: true, min: 0, message: ' ' }]}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={publishingPrice}>Publish</Button>
        </Form.Item>
      </Form>
      <Button block type="link" onClick={() => setSimulatorVisible(false)}>Cancel</Button>
    </Modal>
  </>);
}

StockForm.propTypes = {
  symbol: PropTypes.string
};

StockForm.defaultProps = {
};

export default withRouter(StockForm);
