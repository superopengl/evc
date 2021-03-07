import { Button, Space, Row, Col, Card, PageHeader, Tag, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { updateStock, getStock, unwatchStock, watchStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import { SyncOutlined } from '@ant-design/icons';
import StockInfoCard from 'components/StockInfoCard';
import StockInsiderTransactionPanel from 'components/StockInsiderTransactionPanel';
import StockNewsPanel from 'components/StockNewsPanel';
import StockEarningsPanel from 'components/StockEarningsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import AdminStockPublishPanel from '../Stock/AdminStockPublishPanel';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import TagSelect from 'components/TagSelect';
import { listStockTags, saveStockTag } from 'services/stockTagService';
import StockPutCallRatioChart from 'components/charts/StockPutCallRatioChart';
import PropTypes from "prop-types";
import { MemberOnlyIcon } from 'components/MemberOnlyIcon';
import StockRosterPanel from 'components/StockRosterPanel';
import {MemberOnlyCard} from 'components/MemberOnlyCard';


const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12
};

const StockAdminPage = (props) => {
  const { symbol } = props;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [stockTags, setStockTags] = React.useState([]);

  const isAdminOrAgent = ['admin', 'agent'].includes(role);
  const isMember = role === 'member';

  const loadEntity = async () => {
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStock(symbol);
      const tags = await listStockTags();
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
        setStockTags(tags);
        setWatched(stock.watched);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (symbol) {
      loadEntity()
    }
  }, [symbol]);

  const handleToggleWatch = async watching => {
    stock.watched = watching;
    if (watching) {
      await watchStock(stock.symbol);
    } else {
      await unwatchStock(stock.symbol);
    }
    setWatched(watching);
  }

  const handleRefresh = () => {
    loadEntity();
  }

  const handleChangeTags = async (tagIds) => {
    stock.tags = tagIds.map(t => t.id || t);
    await updateStock(stock);
  }

  return (
    <>
      {loading ? <Loading /> : <>
        <PageHeader
          style={{ paddingTop: 0 }}
          ghost={false}
          onBack={() => props.history.goBack()}
          title={<Space size="middle">
            <StockName value={stock} />
            {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}
            {isMember && <StockWatchButton size={20} value={watched} onChange={handleToggleWatch} />}
          </Space>}
          extra={[
            <Button key="sync" type="primary" ghost icon={<SyncOutlined />} onClick={handleRefresh} />,

            // <Space key="tag"><StockTagSelect value={stock.tags} onChange={tags => handleSaveForm('tags', tags.map(t => t.id))} /></Space>,
            // <Button key="1" disabled={loading} onClick={() => handleSyncEps()} loading={epsSyncing}>Sync Last 4 EPS</Button>,
            // <Button key="0" type="danger" disabled={loading} onClick={handleDelete} icon={<DeleteOutlined />}></Button>,
            // <Button key="2" disabled={loading} onClick={() => setDrawerVisible(true)} icon={<EditOutlined />} />
          ]}
        />
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* <Divider /> */}
          {/* <Text type="secondary">Electronic Technology</Text> */}
          <TagSelect value={stock.tags} readonly={!isAdminOrAgent}
            onChange={tagIds => handleChangeTags(tagIds)}
            tags={stockTags}
            onSave={saveStockTag}
          />
          <Row gutter={20} wrap={false}>
            <Col flex="none">
              <StockQuotePanel symbol={stock.symbol} />
              {/* <StockInfoCard value={stock} showWatch={false} title={<>EVC Fair Value / Support / Resistance <MemberOnlyIcon /></>} /> */}
            </Col>
            <Col flex="auto">
              <StockChart symbol={stock.symbol} period="1d" interval="5m" />
            </Col>
          </Row>
          <AdminStockPublishPanel stock={stock} />
          {/* <Col {...span}>
              <Card title={<>Earnings Today</>}>
                <StockEarningsPanel symbol={stock.symbol} />
              </Card>
            </Col> */}
          <Row gutter={20}>
            <Col span={12}>
              <MemberOnlyCard title={<>News</>}>
                <StockNewsPanel symbol={stock.symbol} />
              </MemberOnlyCard>
            </Col>
            <Col span={12}>
              <MemberOnlyCard title={<>Option Put-Call Ratio</>}>
                <StockPutCallRatioChart symbol={stock.symbol} />
              </MemberOnlyCard>
              <MemberOnlyCard title={<>Roster</>} style={{ marginBottom: 20 }}>
                <StockRosterPanel symbol={stock.symbol} />
              </MemberOnlyCard>
              <MemberOnlyCard title={<>Insider Transactions</>}>
                <StockInsiderTransactionPanel symbol={stock.symbol} />
              </MemberOnlyCard>
            </Col>
          </Row>
        </Space>
      </>}
    </>
  );
};

StockAdminPage.propTypes = {
  symbol: PropTypes.string.isRequired,
};

StockAdminPage.defaultProps = {};

export default withRouter(StockAdminPage);
