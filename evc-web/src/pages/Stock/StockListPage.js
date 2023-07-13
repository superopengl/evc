import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Space, Checkbox, Input, Form, Radio, Pagination, Button } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { GlobalContext } from 'contexts/GlobalContext';
import StockList from '../../components/StockList';
import { createStock, searchStock } from 'services/stockService';
import { withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { CheckSquareOutlined, BorderOutlined, SearchOutlined, SyncOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';
import { Loading } from 'components/Loading';
import StockTagSelect from 'components/StockTagSelect';
import { Divider } from 'antd';
import StockTagFilter from 'components/StockTagFilter';
import StockInfoCard from 'components/StockInfoCard';
import { StockSearchInput } from 'components/StockSearchInput';
import HeaderStockSearch from 'components/HeaderStockSearch';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem 4rem 1rem;
width: 100%;
// max-width: 600px;
`;

const OverButton = styled(Button)`
color: rgba(0, 0, 0, 0.85);

&:active, &:focus, &:hover {
  color: rgba(0, 0, 0, 0.85);
  border-color: #d9d9d9;
}

&.selected {
  border-color: #fadb14;
  background: #ffffb8;
}`;

const UnderButton = styled(Button)`
color: rgba(0, 0, 0, 0.85);

&:active, &:focus, &:hover {
  color: rgba(0, 0, 0, 0.85);
  border-color: #d9d9d9;
}

&.selected {
  border-color: #13c2c2;
  background: #bffbff;
}`;

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

  const updateWithResponse = (loadResponse, queryInfo) => {
    if (loadResponse) {
      const { count, page, data } = loadResponse;
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList([...data]);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
    }
  }

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        const resp = await searchStock(queryInfo);
        updateWithResponse(resp, queryInfo);
      } else {
        setQueryInfo(queryInfo);
      }
    } catch {
      setLoading(false);
    }
    // Not remember the search text in local storage
    reactLocalStorage.setObject(LOCAL_STORAGE_QUERY_KEY, { ...queryInfo, text: '' });
  }

  React.useEffect(() => {
    searchByQueryInfo(queryInfo);
  }, []);

  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, page: 1, tags });
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  const handleToggleOverValued = () => {
    searchByQueryInfo({ ...queryInfo, page: 1, overValued: !queryInfo.overValued });
  }

  const handleToggleUnderValued = () => {
    searchByQueryInfo({ ...queryInfo, page: 1, underValued: !queryInfo.underValued });
  }
  return (
    <LayoutStyled>
      <HomeHeader>
      </HomeHeader>
      <ContainerStyled>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <Space>
            <OverButton type="secondary" onClick={handleToggleOverValued} className={queryInfo.overValued ? 'selected' : ''}>
              {queryInfo.overValued ? <CheckSquareOutlined /> : <BorderOutlined />} Over valued
            </OverButton>
            <UnderButton type="secondary" onClick={handleToggleUnderValued} className={queryInfo.underValued ? 'selected' : ''}>
              {queryInfo.underValued ? <CheckSquareOutlined /> : <BorderOutlined />} Under valued
            </UnderButton>
          </Space>
          <StockTagFilter value={queryInfo.tags} onChange={handleTagFilterChange} />
          <StockList data={list} loading={loading} onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)} />
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
        </Space>
      </ContainerStyled>
    </LayoutStyled>
  );
};

StockListPage.propTypes = {};

StockListPage.defaultProps = {};

export default withRouter(StockListPage);
