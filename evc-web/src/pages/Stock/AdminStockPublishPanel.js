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
  listStockSupportShort, saveStockSupportShort, deleteStockSupportShort,
  listStockSupportLong, saveStockSupportLong, deleteStockSupportLong,
  listStockResistanceShort, saveStockResistanceShort, deleteStockResistanceShort,
  listStockResistanceLong, saveStockResistanceLong, deleteStockResistanceLong,
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
  resistanceShortId: null,
  resistanceLongId: null,
  supportShortId: null,
  supportLongId: null,
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
  const [supportShortList, setSupportShortList] = React.useState([]);
  const [supportLongList, setSupportLongList] = React.useState([]);
  const [resistanceShortList, setResistanceShortList] = React.useState([]);
  const [resistanceLongList, setResistanceLongList] = React.useState([]);
  const [valueList, setValueList] = React.useState([]);
  const [publishList, setPublishList] = React.useState([]);
  const [selected, setSelected] = React.useState(DEFAULT_SELECTED);

  const { symbol } = stock;
  const handleChangeTags = async (tagIds) => {
    stock.tags = tagIds.map(t => t.id || t);
    await updateStock(stock);
  }

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
      supportShortId: supportShortList[0].id,
      supportLongId: supportLongList[0].id,
      resistanceShortId: resistanceShortList[0].id,
      resistanceLongId: resistanceLongList[0].id,
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

  const getClassNameOnSelectForSupportShortItem = item => {
    return `${item.id === selected.supportShortId ? 'current-selected-datepoint' : ''} ${selected.source === 'support_short' ? 'source' : ''}`;
  }

  const getClassNameOnSelectForSupportLongItem = item => {
    return `${item.id === selected.supportLongId ? 'current-selected-datepoint' : ''} ${selected.source === 'support_long' ? 'source' : ''}`;
  }

  const updateSelectedBySupportShort = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'support_short',
      supportShortId: item.id,
    });
  }

  const updateSelectedBySupportLong = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'support_long',
      supportLongId: item.id,
    });
  }

  const getClassNameOnSelectForResistanceShortItem = item => {
    return `${item.id === selected.resistanceShortId ? 'current-selected-datepoint' : ''} ${selected.source === 'resistance_short' ? 'source' : ''}`;
  }

  const getClassNameOnSelectForResistanceLongItem = item => {
    return `${item.id === selected.resistanceLongId ? 'current-selected-datepoint' : ''} ${selected.source === 'resistance_long' ? 'source' : ''}`;
  }

  const updateSelectedByResistanceShort = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'resistance_short',
      resistanceShortId: item.id,
    });
  }

  const updateSelectedByResistanceLong = (item) => {
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'resistance_long',
      resistanceLongId: item.id,
    });
  }

  const updateSelectedByPublish = (item) => {
    const value = valueList.find(x => x.id === item.fairValueId);
    setSelected({
      ...DEFAULT_SELECTED,
      source: 'publish',
      publishId: item.id,
      supportShortId: item.supportShortId,
      supportLongId: item.supportLongId,
      resistanceShortId: item.resistanceShortId,
      resistanceLongId: item.resistanceLongId,
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
        case 'support_short':
          return item.supportShortId === selected.supportShortId;
        case 'support_long':
          return item.supportLongId === selected.supportLongId;
        case 'resistance_short':
          return item.resistanceShortId === selected.resistanceShortId;
        case 'resistance_long':
          return item.resistanceLongId === selected.resistanceLongId;
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
    <StockTagSelect value={stock.tags} onChange={tags => handleChangeTags(tags.map(t => t.id))} />
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
            disabled={!valueList?.length || !supportShortList?.length || !supportLongList?.length || !resistanceShortList?.length || !resistanceLongList?.length}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Support (short)">
          <StockRangeTimelineEditor
            onLoadList={() => listStockSupportShort(symbol)}
            onSaveNew={([lo, hi]) => saveStockSupportShort(symbol, lo, hi)}
            onDelete={id => deleteStockSupportShort(id)}
            onChange={list => setSupportShortList(list)}
            onSelected={updateSelectedBySupportShort}
            getClassNameOnSelect={getClassNameOnSelectForSupportShortItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Support (long)">
          <StockRangeTimelineEditor
            onLoadList={() => listStockSupportLong(symbol)}
            onSaveNew={([lo, hi]) => saveStockSupportLong(symbol, lo, hi)}
            onDelete={id => deleteStockSupportLong(id)}
            onChange={list => setSupportLongList(list)}
            onSelected={updateSelectedBySupportLong}
            getClassNameOnSelect={getClassNameOnSelectForSupportLongItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Resistance (short)">
          <StockRangeTimelineEditor
            onLoadList={() => listStockResistanceShort(symbol)}
            onSaveNew={([lo, hi]) => saveStockResistanceShort(symbol, lo, hi)}
            onDelete={id => deleteStockResistanceShort(id)}
            onChange={list => setResistanceShortList(list)}
            onSelected={updateSelectedByResistanceShort}
            getClassNameOnSelect={getClassNameOnSelectForResistanceShortItem}
          />
        </ColInnerCard>
      </ColStyled>
      <ColStyled {...span}>
        <ColInnerCard title="Resistance (long)">
          <StockRangeTimelineEditor
            onLoadList={() => listStockResistanceLong(symbol)}
            onSaveNew={([lo, hi]) => saveStockResistanceLong(symbol, lo, hi)}
            onDelete={id => deleteStockResistanceLong(id)}
            onChange={list => setResistanceLongList(list)}
            onSelected={updateSelectedByResistanceLong}
            getClassNameOnSelect={getClassNameOnSelectForResistanceLongItem}
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
