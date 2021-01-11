import { Button, Layout, Modal, Space, Typography, Row, Col, Card, PageHeader, Drawer } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';
import { Empty } from 'antd';
import { Loading } from 'components/Loading';
import { Tooltip } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { isProfileComplete } from 'util/isProfileComplete';
import { StockSearchInput } from 'components/StockSearchInput';
import { searchSingleStock, updateStock, getStock, unwatchStock, watchStock } from 'services/stockService';
import { List } from 'antd';
import StockCardClientSearch from 'components/StockCardClientSearch';
import { reactLocalStorage } from 'reactjs-localstorage';
import { StockName } from 'components/StockName';
import { DeleteOutlined, EditOutlined, LockFilled, EyeInvisibleOutlined, SyncOutlined } from '@ant-design/icons';
import StockInfoCard from 'components/StockInfoCard';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import StockInsiderPanel from 'components/StockInsiderPanel';
import StockNewsPanel from 'components/StockNewsPanel';
import StockEarningsPanel from 'components/StockEarningsPanel';
import StockChart from 'components/charts/StockChart';
import StockQuotePanel from 'components/StockQuotePanel';
import AdminStockPublishPanel from '../Stock/AdminStockPublishPanel';
import { StockWatchButton } from 'components/StockWatchButton';
import ReactDOM from "react-dom";
import StockTagSelect from 'components/StockTagSelect';
import HeaderStockSearch from 'components/HeaderStockSearch';

const { Paragraph, Text } = Typography;
const { Header, Content, Sider } = Layout;

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

const StockPanelContainer = styled.div`
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 4px;
  padding: 1rem;
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
  const [insiderVisible, setInsiderVisible] = React.useState(false);

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
            ghost={false}
            onBack={() => props.history.goBack()}
            title={<Space size="middle"><StockName value={stock} />{isClient && <StockWatchButton size={20} value={watched} onChange={handleToggleWatch} />}</Space>}
            extra={[
              <Button key="insider" type="primary" ghost onClick={() => setInsiderVisible(true)}>Insider Transactions <MemberOnlyIcon /></Button>,
              <Button key="sync" type="primary" ghost icon={<SyncOutlined />} onClick={handleRefresh} />,

              // <Space key="tag"><StockTagSelect value={stock.tags} onChange={tags => handleSaveForm('tags', tags.map(t => t.id))} /></Space>,
              // <Button key="1" disabled={loading} onClick={() => handleSyncEps()} loading={epsSyncing}>Sync Last 4 EPS</Button>,
              // <Button key="0" type="danger" disabled={loading} onClick={handleDelete} icon={<DeleteOutlined />}></Button>,
              // <Button key="2" disabled={loading} onClick={() => setDrawerVisible(true)} icon={<EditOutlined />} />
            ]}
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* <Text type="secondary">Electronic Technology</Text> */}
            <StockTagSelect value={stock.tags} readonly={!isAdminOrAgent} onChange={tags => handleChangeTags(tags.map(t => t.id))} />
            <StockQuotePanel symbol={stock.symbol} />
            {isAdminOrAgent && stock && <AdminStockPublishPanel stock={stock} />}
            <Row gutter={20} wrap={false}>
              {!isAdminOrAgent && <Col flex="none">
                <StockInfoCard value={stock} showWatch={false} title={<>EVC Fair Value / Support / Resistance <MemberOnlyIcon /></>} />
              </Col>}
              <Col flex="auto">
                <Card size="small" type="inner" title="Chart">
                  <StockChart symbol={stock.symbol} period="1d" interval="5m"/>
                </Card>
              </Col>
            </Row>
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
            {stock && <Row >
              <StockNewsPanel symbol={stock.symbol} />
            </Row>}
          </Space>
        </>}
      </ContainerStyled>
      <Drawer
        visible={insiderVisible && stock}
        title="Insider Transactions"
        destroyOnClose={true}
        closable={true}
        maskClosable={true}
        onClose={() => setInsiderVisible(false)}
        width="80vw"
      >
        {stock && <StockInsiderPanel symbol={stock.symbol} />}
      </Drawer>
    </LayoutStyled >
  );
};

StockPage.propTypes = {};

StockPage.defaultProps = {};

export default withRouter(StockPage);
