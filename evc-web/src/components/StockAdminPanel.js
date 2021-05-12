import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Form, Modal, InputNumber, Row, Col, Card, Space, Alert } from 'antd';
import PropTypes from 'prop-types';
import { notify } from 'util/notify';
import {
  listStockSupport, saveStockSupport, deleteStockSupport,
  listStockResistance, saveStockResistance, deleteStockResistance,
  listStockEps, saveStockEps, deleteStockEps,
  listStockFairValue, saveStockFairValue, deleteStockFairValue,
} from 'services/stockService';
import { Loading } from 'components/Loading';
import { MemberOnlyCard } from 'components/MemberOnlyCard';
import { StockName } from 'components/StockName';
import { publishEvent } from 'services/eventSourceService';

import { StockRangeTimelineEditor } from '../pages/Stock/StockRangeTimelineEditor';
import StockEpsAdminEditor from '../pages/Stock/StockEpsAdminPanel';
import { StockFairValueEditor } from '../pages/Stock/StockFairValueEditor';
import StockDataInfoPanel from './StockDataInfoPanel';
const { Text, Paragraph } = Typography;


const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;

  .ant-page-header {
    padding-left: 0;
    padding-right: 0;
  }

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }

  .ant-card-head, .ant-card {
    // background-color: rgba(0, 41, 61, 0.1);
  }

  .ant-card-body {
    padding-left: 0;
    padding-right: 0;
  }
`;
// const ColInnerCard = styled(Card)`
// height: 100%;
// `;

const ColInnerCard = props => {
  const { children, ...other } = props
  return <Card
    type="inner"
    bordered={false}
    size="small"
    headStyle={{
      backgroundColor: '#55B0D4',
      color: 'white',
    }}
    bodyStyle={{
      maxHeight: 400,
      overflow: 'auto',

    }}
    {...other}
  >
    {props.children}
  </Card>
};

const StockAdminPanel = (props) => {

  const { onDataChange } = props;

  const [stock] = React.useState(props.stock);
  const [simulatorVisible, setSimulatorVisible] = React.useState(false);
  const [publishingPrice, setPublishingPrice] = React.useState(false);

  const { symbol } = stock;

  const handlePublishMarketPrice = async (values) => {
    const { price } = values;
    try {
      setPublishingPrice(true);

      const event = {
        type: 'market-price',
        symbol,
        price,
        by: 'simulator'
      };
      await publishEvent(event);
      notify.success(`Publishing market price at $${price}`);

    } finally {
      setPublishingPrice(false);
    }
  }

  if (symbol && !stock) {
    return <Loading />
  }

  const span = {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 6
  };

  return (<Container>
    <Row gutter={[30, 30]} style={{ marginTop: 20 }} wrap={true}>
      <Col {...span}>
        <ColInnerCard title="Data Info">
          <StockDataInfoPanel
            symbol={symbol}
          />
        </ColInnerCard>
      </Col>
      <Col {...span}>
        <ColInnerCard title="EPS">
          <StockEpsAdminEditor
            symbol={symbol}
            onLoadList={() => listStockEps(symbol)}
            onSaveNew={values => saveStockEps(symbol, values)}
            onDelete={(symbol, reportDate) => deleteStockEps(symbol, reportDate)}
          />
        </ColInnerCard>
      </Col>
      <Col {...span}>
        <ColInnerCard title="Support" >
          <StockRangeTimelineEditor
            onLoadList={() => listStockSupport(symbol)}
            onSaveNew={async ([lo, hi]) => {
              await saveStockSupport(symbol, lo, hi);
              onDataChange();
            }}
            onDelete={async id => {
              await deleteStockSupport(id);
              onDataChange();
            }}
          />
        </ColInnerCard>
      </Col>
      <Col {...span}>
        <ColInnerCard title="Resistance" >
          <StockRangeTimelineEditor
            onLoadList={() => listStockResistance(symbol)}
            onSaveNew={async ([lo, hi]) => {
              await saveStockResistance(symbol, lo, hi);
              onDataChange();
            }}
            onDelete={async id => {
              await deleteStockResistance(id);
              onDataChange();
            }}
          />
        </ColInnerCard>
      </Col>
      <Col span={24}>
        <ColInnerCard 
          type="inner"
        title="Fair Value">
          <Space direction="vertical">

            <Alert
              type="info"
              showIcon
              description={<>
                If the <strong>TtmEps</strong> shows <Text type="danger">n/a</Text>, it's because we cannot fetch EPS from our data provider.<br />
          Minus or zero <strong>TtmEps</strong> values are not valid to compute out PE90 nor fair values. In this case, <strong>PE90</strong> will always be <Text type="danger">n/a</Text> and special fair values need to be input manually.<br />
          If the <strong>TtmEps</strong> has positive value, but the <strong>PE90</strong> shows <Text type="danger">n/a</Text>, it's because there is no enough close price data to compute the PE value.
          </>}
            />
            <StockFairValueEditor
              symbol={stock.symbol}
              onLoadList={() => listStockFairValue(symbol)}
              onSaveNew={async payload => {
                await saveStockFairValue(symbol, payload);
                onDataChange();
              }}
              onDelete={async id => {
                await deleteStockFairValue(id);
                onDataChange();
              }}
            />
          </Space>
        </ColInnerCard>
      </Col>
    </Row>

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
  </Container >);
}

StockAdminPanel.propTypes = {
  stock: PropTypes.object.isRequired,
  onDataChange: PropTypes.func,
};

StockAdminPanel.defaultProps = {
  onDataChange: () => { }
};

export default withRouter(StockAdminPanel);
