import { Button, Layout, Space, Typography, Row, Col, Card, PageHeader, Drawer, Tag } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { GlobalContext } from 'contexts/GlobalContext';
import { updateStock, getStock, unwatchStock, watchStock } from 'services/stockService';
import { StockName } from 'components/StockName';
import { LockFilled, SyncOutlined } from '@ant-design/icons';
import StockInfoCard from 'components/StockInfoCard';
import StockInsiderPanel from 'components/StockInsiderPanel';
import StockNewsPanel from 'components/StockNewsPanel';
import StockEarningsPanel from 'components/StockEarningsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import AdminStockPublishPanel from '../Stock/AdminStockPublishPanel';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import TagSelect from 'components/TagSelect';
import INSIDER_LEGEND_INFOS from '../../def/insiderLegendDef';
import { listStockTags, saveStockTag } from 'services/stockTagService';

const { Text } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem 1rem;
  width: 100%;
  // max-width: 1000px;

  // .ant-divider {
  //   margin: 8px 0 24px;
  // }

  .ant-page-header {
    padding-left: 0;
    padding-right: 0;
  }
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;


  .task-count .ant-badge-count {
    background-color: #15be53;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #15be53 inset;
  }
`;


const MemberOnlyIcon = () => <Text type="danger"><LockFilled /></Text>

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 12,
  xxl: 12
};

const StockPage = (props) => {
  const symbol = props.match.params.symbol;

  const context = React.useContext(GlobalContext);
  const { role } = context;
  const [stock, setStock] = React.useState();
  const [watched, setWatched] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const isAdminOrAgent = ['admin', 'agent'].includes(role);
  const isClient = role === 'client';

  const loadEntity = async () => {
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const stock = await getStock(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setStock(stock);
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
    <LayoutStyled>
      <HomeHeader>
      </HomeHeader>
      <ContainerStyled>
        {loading ? <Loading /> : <>
          <PageHeader
            style={{ paddingTop: 0 }}
            ghost={false}
            onBack={() => props.history.goBack()}
            title={<Space size="middle">
              <StockName value={stock} />
              {stock?.isOver ? <Tag color="yellow">over valued</Tag> : stock?.isUnder ? <Tag color="cyan">under valued</Tag> : null}
              {isClient && <StockWatchButton size={20} value={watched} onChange={handleToggleWatch} />}
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
            {/* <Text type="secondary">Electronic Technology</Text> */}
            <TagSelect value={stock.tags} readonly={!isAdminOrAgent}
              onChange={tagIds => handleChangeTags(tagIds)}
              onList={listStockTags}
              onSave={saveStockTag}
            />
            <StockQuotePanel symbol={stock.symbol} />
            <Row gutter={20} wrap={false}>
              <Col flex="none">
                <StockInfoCard value={stock} showWatch={false} title={<>EVC Fair Value / Support / Resistance <MemberOnlyIcon /></>} />
              </Col>
              <Col flex="auto">
                <StockChart symbol={stock.symbol} period="1d" interval="5m" />
              </Col>
            </Row>
            {isAdminOrAgent && stock && <AdminStockPublishPanel stock={stock} />}
            <Row gutter={20} >
              <Col {...span}>
                <Card size="small" type="inner" title={<>Option Put-Call Ratio  <MemberOnlyIcon /></>}>
                  调用Advanced Stats中的putCallRatio
                  做成实时图表，最好能显示近一年平均值，两者方便对比。
                </Card>
              </Col>
              <Col {...span}>
                <Card size="small" type="inner" title={<>Earnings Today</>}>
                  <StockEarningsPanel symbol={stock.symbol} />
                </Card>
              </Col>
            </Row>
            {stock && <Row gutter={20}>
              <Col span={12}>
                <Card size="small" type="inner" title={<>News</>}>
                  <StockNewsPanel symbol={stock.symbol} />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" type="inner" title={<>Insider Transactions  <MemberOnlyIcon /></>}>

                  <StockInsiderPanel symbol={stock.symbol} />

                </Card>
              </Col>
            </Row>}
          </Space>
        </>}
      </ContainerStyled>
    </LayoutStyled >
  );
};

StockPage.propTypes = {};

StockPage.defaultProps = {};

export default withRouter(StockPage);
