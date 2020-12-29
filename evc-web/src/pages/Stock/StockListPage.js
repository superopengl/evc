import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Space, Button, Input, Form, Modal, Pagination, List } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { GlobalContext } from 'contexts/GlobalContext';
import StockList from '../../components/StockList';
import { createStock, searchStock } from 'services/stockService';
import { withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';
import { Loading } from 'components/Loading';
import StockTagSelect from 'components/StockTagSelect';
import { Divider } from 'antd';
import StockTagFilter from 'components/StockTagFilter';
import StockInfoCard from 'components/StockInfoCard';
import { StockSearchInput } from 'components/StockSearchInput';

const { Title, Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem 4rem 1rem;
width: 100%;
// max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;

const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 50,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_QUERY_KEY = 'stock_query'

const StockListPage = (props) => {

  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_QUERY_KEY, DEFAULT_QUERY_INFO, true))
  const [total, setTotal] = React.useState(0);
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loadResponse, setLoadResponse] = React.useState();

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        setLoadResponse(await searchStock(queryInfo));
      } else {
        setQueryInfo(queryInfo);
      }
    } finally {
      setLoading(false);
    }
    // Not remember the search text in local storage
    reactLocalStorage.setObject(LOCAL_STORAGE_QUERY_KEY, { ...queryInfo, text: '' });
  }

  React.useEffect(() => {
    searchByQueryInfo(queryInfo);
  }, []);

  React.useEffect(() => {
    if (loadResponse) {
      const { count, page, data } = loadResponse;
      setTotal(count);
      setList([...data]);
      setQueryInfo({ ...queryInfo, page });
    }
  }, [loadResponse]);


  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, page: 1, tags });
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  return (
    <LayoutStyled>
      <HomeHeader>
        <StockSearchInput
          onChange={handleSelectedStock}
          style={{ width: '100%', maxWidth: 400 }} />
      </HomeHeader>
      <ContainerStyled>
        <Loading loading={loading}>
          <Space size="small" direction="vertical" style={{ width: '100%' }}>
            {/* <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Stock List</Title>
          </StyledTitleRow> */}
            <StockTagFilter value={queryInfo.tags} onChange={handleTagFilterChange} />
            <Pagination
              total={85}
              current={queryInfo.page}
              pageSize={queryInfo.size}
              total={total}
              defaultCurrent={queryInfo.page}
              defaultPageSize={queryInfo.size}
              pageSizeOptions={[10, 20, 50]}
              showSizeChanger
              showQuickJumper
              showTotal={total => `Total ${total}`}
              disabled={loading}
              onChange={handlePaginationChange}
              onShowSizeChange={(current, size) => {
                searchByQueryInfo({ ...queryInfo, page: current, size });
              }}
            />
            <Divider />
            <StockList data={list} onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)} />
          </Space>
        </Loading>
      </ContainerStyled>
    </LayoutStyled>
  );
};

StockListPage.propTypes = {};

StockListPage.defaultProps = {};

export default withRouter(StockListPage);
