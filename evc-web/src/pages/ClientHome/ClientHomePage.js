import { Button, Layout, Modal, Space, Typography, Tabs, Row, Col } from 'antd';
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
import { searchSingleStock, getStockHistory, getWatchList, unwatchStock, watchStock } from 'services/stockService';
import { List } from 'antd';
import StockCardClientSearch from 'components/StockCardClientSearch';
import { reactLocalStorage } from 'reactjs-localstorage';
import { StockName } from 'components/StockName';
import StockClientPanel from 'components/StockClientPanel';
import StockList from 'components/StockList';

const { Paragraph, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem 1rem;
  width: 100%;
  // max-width: 1000px;

  // .ant-divider {
  //   margin: 8px 0 24px;
  // }
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

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;

const StockPanelContainer = styled.div`
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 4px;
  padding: 1rem;
`;

const ClientHomePage = (props) => {

  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;
  const isProfileMissing = !isProfileComplete(user);
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [searchResult, setSearchResult] = React.useState();
  const [taskListByPortfolioMap, setTaskListByPortfolioMap] = React.useState({});
  const [searchList, setSearchList] = React.useState([]);
  const [watchList, setWatchList] = React.useState([]);

  const loadList = async () => {
    try {
      if (isProfileMissing) {
        setProfileModalVisible(true);
        return;
      }

      setLoading(true);
      // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
      const watchList = await getWatchList();
      setWatchList(watchList);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList()
  }, []);


  const handleSaveProfile = updatedUser => {
    setUser(updatedUser);
    setProfileModalVisible(false);
  }

  const handleSearchChange = async symbol => {
    const stock = await searchSingleStock(symbol);
    setSearchResult(stock);
    // if (searchList.some(x => x.symbol === stock.symbol)) {
    //   return;
    // }
    // setSearchList([...searchList, stock]);
  }

  const handleCloseSearchResult = () => {
    setSearchResult(null);
  }

  const handleAddToWatchlist = async (stock) => {
    setSearchResult(null);
    await watchStock(stock.symbol);
    setWatchList([...watchList, stock]);
  }

  const handleUnwatch = async (stock) => {
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

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <StockSearchInput
          onChange={handleSearchChange}
          style={{ width: '100%', maxWidth: 400 }} />
        {/* <SubscriptionArea /> */}
        {/* <Paragraph>You can go to the <Link to="/account">Account</Link> page to upgrade your subscription plan to get better service.</Paragraph> */}
        <Divider />
        <StockList data={watchList} loading={loading} onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)}/>
      </ContainerStyled>
      <Modal
        visible={searchResult}
        destroyOnClose={true}
        maskClosable={true}
        closable={true}
        onOk={handleCloseSearchResult}
        onCancel={handleCloseSearchResult}
        footer={null}
        title={searchResult ? <>{searchResult.symbol} <Text type="secondary"><small>({searchResult.company})</small></Text></> : null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>

          <StockCardClientSearch value={searchResult} />
          <Button block type="primary" icon={<EyeOutlined />} onClick={() => handleAddToWatchlist(searchResult)}>Add to watchlist</Button>
          <Button block onClick={handleCloseSearchResult}>Cancel</Button>
        </Space>
      </Modal>
      <Modal
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        closable={false}
        title="Set Profile"
        footer={null}
      >
        <Paragraph type="secondary">Please set up your profile to continue using the system.</Paragraph>
        <ProfileForm user={context.user} initial={true} onOk={user => handleSaveProfile(user)} />
      </Modal>
    </LayoutStyled >
  );
};

ClientHomePage.propTypes = {};

ClientHomePage.defaultProps = {};

export default withRouter(ClientHomePage);
