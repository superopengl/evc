import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Form, Modal, InputNumber, Row, Col, Card, Tooltip } from 'antd';
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
import StockEpsTimelineEditor from '../pages/Stock/StockEpsTimelineEditor';
import { StockFairValueEditor } from '../pages/Stock/StockFairValueEditor';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
  const {children, ...other} = props
return <Card 
type="inner"
bordered={false}
size="small"
{...other}
>
  {props.children}
  </Card>
};




const DEFAULT_SELECTED = {
  source: '',
  publishId: null,
  resistanceId: null,
  supportId: null,
  fairValueId: null,
  epsIds: [],
  epId: null,
};

const StockAdminPanel = (props) => {
  const [stock] = React.useState(props.stock);
  const [simulatorVisible, setSimulatorVisible] = React.useState(false);
  const [publishingPrice, setPublishingPrice] = React.useState(false);
  const [epsList, setEpsList] = React.useState([]);
  const [peList] = React.useState([]);
  const [, setSupportList] = React.useState([]);
  const [, setResistanceList] = React.useState([]);
  const [valueList, setValueList] = React.useState([]);
  const [] = React.useState([]);
  const [selected, setSelected] = React.useState(DEFAULT_SELECTED);

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

  const getClassNameOnSelectForEpsItem = item => {
    return `${selected.epsIds.includes(item.id) ? 'current-selected-datepoint' : ''} ${selected.source === 'eps' ? 'source' : ''}`;
  }

  const updateSelectedByEps = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'eps',
      epsIds: [item.id]
    });
  }



  const getClassNameOnSelectForValueItem = item => {
    const shouldHighlight = () => {
      switch (selected.source) {
        case 'value':
        case 'publish':
          return item.id === selected.fairValueId;
        case 'pe':
          return item.peId === selected.peId;
        case 'eps':
          return item.epsIds.some(x => selected.epsIds.includes(x));
        default:
          return false;
      }
    }

    return `${shouldHighlight() ? 'current-selected-datepoint' : ''} ${selected.source === 'value' ? 'source' : ''}`;
  }

  const updateSelectedByValue = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'value',
      fairValueId: item.id,
      epsIds: item.epsIds,
      peId: item.peId
    });
  }

  const getClassNameOnSelectForSupportItem = item => {
    return `${item.id === selected.supportId ? 'current-selected-datepoint' : ''} ${selected.source === 'support' ? 'source' : ''}`;
  }

  const updateSelectedBySupport = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'support',
      supportId: item.id,
    });
  }


  const getClassNameOnSelectForResistanceItem = item => {
    return `${item.id === selected.resistanceId ? 'current-selected-datepoint' : ''} ${selected.source === 'resistance' ? 'source' : ''}`;
  }

  const updateSelectedByResistance = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'resistance',
      resistanceId: item.id,
    });
  }




  return (<Container>
    <Row gutter={[20, 20]} style={{ marginTop: 20 }} wrap={true}>
      <Col flex="auto">
        <ColInnerCard title="EPS">
          <StockEpsTimelineEditor
            symbol={symbol}
            onLoadList={() => listStockEps(symbol)}
            onSaveNew={values => saveStockEps(symbol, values)}
            onDelete={(symbol, reportDate) => deleteStockEps(symbol, reportDate)}
            onChange={list => setEpsList(list)}
            onSelected={updateSelectedByEps}
            getClassNameOnSelect={getClassNameOnSelectForEpsItem}
          />
        </ColInnerCard>
      </Col>
      <Col flex="auto">
        <ColInnerCard title="Support">
          <StockRangeTimelineEditor
            onLoadList={() => listStockSupport(symbol)}
            onSaveNew={([lo, hi]) => saveStockSupport(symbol, lo, hi)}
            onDelete={id => deleteStockSupport(id)}
            onChange={list => setSupportList(list)}
            onSelected={updateSelectedBySupport}
            getClassNameOnSelect={getClassNameOnSelectForSupportItem}
          />
        </ColInnerCard>
      </Col>
      <Col flex="auto">
        <ColInnerCard title="Resistance">
          <StockRangeTimelineEditor
            onLoadList={() => listStockResistance(symbol)}
            onSaveNew={([lo, hi]) => saveStockResistance(symbol, lo, hi)}
            onDelete={id => deleteStockResistance(id)}
            onChange={list => setResistanceList(list)}
            onSelected={updateSelectedByResistance}
            getClassNameOnSelect={getClassNameOnSelectForResistanceItem}
          />
        </ColInnerCard>
      </Col>
      <Col span={24}>
        <MemberOnlyCard title="Fair Value" extra={<Tooltip
         placement="leftTop"
         trigger="click"
        title={<>
          It requires at least 4 sequential EPS values and 90 days of close prices (for PE calculation) to compute fair value automatically.<br/>
          If the <strong>TtmEps</strong> shows <Text type="danger">n/a</Text>, it's because we cannot fetch EPS from our data provider.<br/>
          Minus or zero <strong>TtmEps</strong> values are not valid to compute fair values. In this case, special fair values need to be specified manually.<br/>
          If the <strong>TtmEps</strong> has value, but the <strong>PE90</strong> shows <Text type="danger">n/a</Text>, it's because there is no enough close price data to compute the PE value.</>}
        >
          <QuestionCircleOutlined />
        </Tooltip>}>
          <StockFairValueEditor
            symbol={stock.symbol}
            onLoadList={() => listStockFairValue(symbol)}
            onSaveNew={payload => saveStockFairValue(symbol, payload)}
            onDelete={id => deleteStockFairValue(id)}
            onChange={list => setValueList(list)}
          />
        </MemberOnlyCard>
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
  stock: PropTypes.object.isRequired
};

StockAdminPanel.defaultProps = {
};

export default withRouter(StockAdminPanel);