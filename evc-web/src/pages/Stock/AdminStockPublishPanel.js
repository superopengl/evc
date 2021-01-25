import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Space, Form, Input, Modal, Layout, InputNumber, Row, Col, Card } from 'antd';
import { Logo } from 'components/Logo';
import { signUp } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import PropTypes from 'prop-types';
import { Alert } from 'antd';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
import { CountrySelector } from 'components/CountrySelector';
import {
  deleteStock, getStock, updateStock,
  listStockSupport, saveStockSupport, deleteStockSupport,
  listStockResistance, saveStockResistance, deleteStockResistance,
  listStockPe, saveStockPe, deleteStockPe,
  listStockEps, saveStockEps, deleteStockEps,
  listStockFairValue, saveStockFairValue, deleteStockFairValue,
  listStockPublish, saveStockPublish, syncStockEps,
} from 'services/stockService';
import { Loading } from 'components/Loading';
import { StockName } from 'components/StockName';
import { publishEvent } from 'services/eventSourceService';
import { Divider } from 'antd';

import { DeleteOutlined, EditOutlined, EllipsisOutlined, SaveOutlined, SyncOutlined } from '@ant-design/icons';
import { StockRangeTimelineEditor } from './StockRangeTimelineEditor';
import StockEpsTimelineEditor from './StockEpsTimelineEditor';
import { StockFairValueTimelineEditor } from './StockFairValueTimelineEditor';
import { StockPublishTimelineEditor } from './StockPublishTimelineEditor';
import { PageHeader } from 'antd';
import { Select } from 'antd';
import { listStockTags } from 'services/stockTagService';
import StockTag from 'components/StockTag';
import StockTagSelect from 'components/StockTagSelect';
import { Drawer } from 'antd';
const { Title, Text, Paragraph } = Typography;


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
`;

const ColStyled = styled(Col)`
  margin-bottom: 20px;
  // background-color: #f3f3f3;
`;

// const ColInnerCard = styled(Card)`
// height: 100%;
// `;

const ColInnerCard = props => (
  <Card
    size="small"
    type="inner"
    {...props}
    style={{ height: '100%' }}
  >
    {props.children}
  </Card>
)

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
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

const AdminStockPublishPanel = (props) => {
  const [stock, setStock] = React.useState(props.stock);
  const [simulatorVisible, setSimulatorVisible] = React.useState(false);
  const [publishingPrice, setPublishingPrice] = React.useState(false);
  const [epsList, setEpsList] = React.useState([]);
  const [peList, setPeList] = React.useState([]);
  const [supportList, setSupportList] = React.useState([]);
  const [resistanceList, setResistanceList] = React.useState([]);
  const [valueList, setValueList] = React.useState([]);
  const [publishList, setPublishList] = React.useState([]);
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

  const handlePublish = async () => {
    const payload = {
      supportId: supportList[0].id,
      resistanceId: resistanceList[0].id,
      fairValueId: valueList[0].id
    };
    await saveStockPublish(symbol, payload);
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

  const getClassNameOnSelectForPeItem = item => {
    return `${item.id === selected.peId ? 'current-selected-datepoint' : ''} ${selected.source === 'pe' ? 'source' : ''}`;
  }

  const updateSelectedByPe = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'pe',
      peId: item.id
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

  const updateSelectedByPublish = (item) => {
    const value = valueList.find(x => x.id === item.fairValueId);
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'publish',
      publishId: item.id,
      supportId: item.supportId,
      resistanceId: item.resistanceId,
      fairValueId: item.fairValueId,
      peId: value.peId,
      epsIds: value.epsIds
    });
  }


  const getClassNameOnSelectForPublishItem = item => {
    const shouldHighlight = () => {
      switch (selected.source) {
        case 'publish':
          return item.id === selected.publishId;
        case 'support':
          return item.supportId === selected.supportId;
        case 'resistance':
          return item.resistanceId === selected.resistanceId;
        case 'value':
        case 'eps':
        case 'pe':
          return item.fairValueId === selected.fairValueId;
        default:
      }

      return false;
    };

    return `${shouldHighlight() ? 'current-selected-datepoint' : ''} ${selected.source === 'publish' ? 'source' : ''}`;
  }

  return (<Container>
    <Row gutter={20} style={{ marginTop: 20 }}>
      <ColStyled {...span}>
        <ColInnerCard title="EPS">
          <StockEpsTimelineEditor
            symbol={symbol}
            onLoadList={() => listStockEps(symbol)}
            onSaveNew={values => saveStockEps(symbol, values)}
            onDelete={id => deleteStockEps(id)}
            onChange={list => setEpsList(list)}
            onSelected={updateSelectedByEps}
            getClassNameOnSelect={getClassNameOnSelectForEpsItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="PE">
          <StockRangeTimelineEditor
            onLoadList={() => listStockPe(symbol)}
            onSaveNew={([lo, hi]) => saveStockPe(symbol, lo, hi)}
            onChange={list => setPeList(list)}
            onDelete={id => deleteStockPe(id)}
            onSelected={updateSelectedByPe}
            getClassNameOnSelect={getClassNameOnSelectForPeItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Fair Value">
          <StockFairValueTimelineEditor
            onLoadList={() => listStockFairValue(symbol)}
            onSaveNew={payload => saveStockFairValue(symbol, payload)}
            onDelete={id => deleteStockFairValue(id)}
            onChange={list => setValueList(list)}
            sourceEps={epsList}
            sourcePe={peList}
            onSelected={updateSelectedByValue}
            getClassNameOnSelect={getClassNameOnSelectForValueItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Publish History">
          <StockPublishTimelineEditor
            onLoadList={() => listStockPublish(symbol, true)}
            onPublishNew={() => handlePublish()}
            onChange={list => setPublishList(list)}
            onSelected={updateSelectedByPublish}
            getClassNameOnSelect={getClassNameOnSelectForPublishItem}
            disabled={!valueList?.length || !supportList?.length || !resistanceList?.length}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
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
      </ColStyled>
      <ColStyled {...span}>
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
      </ColStyled>
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

AdminStockPublishPanel.propTypes = {
  stock: PropTypes.object.isRequired
};

AdminStockPublishPanel.defaultProps = {
};

export default withRouter(AdminStockPublishPanel);
