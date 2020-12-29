import { Button, Layout, Modal, Space, Typography, Tabs, Row, PageHeader } from 'antd';
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
import { searchSingleStock, getStockHistory, getStock, unwatchStock, watchStock } from 'services/stockService';
import { List } from 'antd';
import StockCardClientSearch from 'components/StockCardClientSearch';
import { reactLocalStorage } from 'reactjs-localstorage';
import { StockName } from 'components/StockName';
import StockClientPanel from 'components/StockClientPanel';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, EyeInvisibleOutlined, SyncOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
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


const span = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1,
  xxl: 1
};

const ClientStockPage = (props) => {
  const symbol = props.match.params.symbol;

  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;
  const isProfileMissing = !isProfileComplete(user);
  const [stock, setStock] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [searchResult, setSearchResult] = React.useState();
  const [taskListByPortfolioMap, setTaskListByPortfolioMap] = React.useState({});
  const [searchList, setSearchList] = React.useState([]);
  const [watchList, setWatchList] = React.useState([]);
  const [key, setKey] = React.useState(0);

  const loadEntity = async () => {
    try {
      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      setStock(await getStock(symbol));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity()
  }, []);


  const handleCloseSearchResult = () => {
    setSearchResult(null);
  }

  const handleAddToWatchlist = async (stock) => {
    setSearchResult(null);
    await watchStock(stock.symbol);
    setWatchList([...watchList, stock]);
  }

  const handleUnwatch = async () => {
    Modal.confirm({
      title: <>Remove <StockName value={stock} /> from watchlist</>,
      async onOk() {
        await unwatchStock(stock.symbol);
        setWatchList(watchList.filter(x => x.symbol !== stock.symbol));
      },
      maskClosable: true,
      okText: 'Yes, unwatch it',
      okButtonProps: {
        danger: true
      },
      onCancel() {
      },
    });
  }

  const handleRefresh = () => {
    loadEntity();
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        {loading ? <Loading /> : <>
          <PageHeader
            ghost={false}
            onBack={() => props.history.push('/')}
            title={<StockName value={stock} />}
            extra={[
              <Button key="sync" type="primary" ghost icon={<SyncOutlined />} onClick={handleRefresh} />,
              <Button key="unwatch" type="primary" ghost icon={<EyeInvisibleOutlined />} onClick={handleUnwatch} />
              
              // <Space key="tag"><StockTagSelect value={stock.tags} onChange={tags => handleSaveForm('tags', tags.map(t => t.id))} /></Space>,
              // <Button key="1" disabled={loading} onClick={() => handleSyncEps()} loading={epsSyncing}>Sync Last 4 EPS</Button>,
              // <Button key="0" type="danger" disabled={loading} onClick={handleDelete} icon={<DeleteOutlined />}></Button>,
              // <Button key="2" disabled={loading} onClick={() => setDrawerVisible(true)} icon={<EditOutlined />} />
            ]}
          />
          <StockClientPanel value={stock} onUnwatch={() => handleUnwatch(stock)} />
        </>}
      </ContainerStyled>
    </LayoutStyled >
  );
};

ClientStockPage.propTypes = {};

ClientStockPage.defaultProps = {};

export default withRouter(ClientStockPage);
