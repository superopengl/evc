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

const { Title, Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem;
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
  const [loading, setLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(false);

  const searchByQueryInfo = async (queryInfo, dryRun = false) => {
    try {
      if (!dryRun) {
        setLoading(true);
        const { count, page, data } = await searchStock(queryInfo);
        setTotal(count);
        setList([...data]);
        setQueryInfo({...queryInfo, page});
      }else {
        setQueryInfo(queryInfo);

      }
      // Not remember the search text in local storage
      reactLocalStorage.setObject(LOCAL_STORAGE_QUERY_KEY, { ...queryInfo, text: '' });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    searchByQueryInfo(queryInfo);
  }, []);

  const addNewStock = () => {
    setVisible(true);
  }

  const handleCreateNew = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const stock = { ...values, tags: values.tags?.map(t => t.id) };
      await createStock(stock);

      props.history.push(`/stock/${stock.symbol.toUpperCase()}`)
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (value) => {
    const text = value?.trim();
    searchByQueryInfo({ ...queryInfo, text });
  }

  const handleSearchChange = async (value) => {
    const text = value?.trim();
    searchByQueryInfo({ ...queryInfo, text }, true);
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, tags });
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Loading loading={loading}>
          <Space size="small" direction="vertical" style={{ width: '100%' }}>
            {/* <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Stock List</Title>
          </StyledTitleRow> */}
            <Space style={{ width: '100%', justifyContent: 'space-between' }} >
              <Input.Search
                placeholder="input search text"
                enterButton={<SearchOutlined />}
                onSearch={value => handleSearch(value)}
                onPressEnter={e => handleSearch(e.target.value)}
                onChange={e => handleSearchChange(e.target.value)}
                loading={false}
                value={queryInfo?.text}
                allowClear
              />
              <Button ghost type="primary" icon={<PlusOutlined />} onClick={() => addNewStock()}></Button>
            </Space>
            <StockTagFilter value={queryInfo.tags} onChange={handleTagFilterChange} />
            <Divider />
            {/* <InfiniteScroll
              initialLoad={true}
              pageStart={0}
              loadMore={() => handleFetchNextPageData()}
              hasMore={!loading && hasMore}
              useWindow={true}
              loader={<Space key="loader" style={{ width: '100%', justifyContent: 'center' }}><Loading /></Space>}
            > */}
            <StockList data={list} />
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
            {/* </InfiniteScroll> */}
          </Space>
        </Loading>
      </ContainerStyled>
      <Modal
        visible={visible}
        closable={true}
        maskClosable={false}
        destroyOnClose={true}
        title="New Stock"
        footer={null}
        width={300}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      >
        <Loading loading={loading}>
          <Form
            layout="vertical"
            onFinish={handleCreateNew}
          // onValuesChange={handleValuesChange}
          // style={{ textAlign: 'left' }}
          >
            <Form.Item label="Symbol" name="symbol" rules={[{ required: true, whitespace: true, message: ' ' }]}>
              <Input placeholder="Stock symbol" allowClear={true} maxLength="100" />
            </Form.Item>
            <Form.Item label="Company Name" name="company" rules={[{ required: true, whitespace: true, message: ' ' }]}>
              <Input placeholder="Company name" autoComplete="family-name" allowClear={true} maxLength="100" />
            </Form.Item>
            {/* <Form.Item label="Tags" name="tags" rules={[{ required: false }]}>
              <StockTagSelect />
            </Form.Item> */}
            <Form.Item>
              <Button type="primary" block htmlType="submit">Create</Button>
            </Form.Item>
          </Form>
        </Loading>
      </Modal>
    </LayoutStyled>
  );
};

StockListPage.propTypes = {};

StockListPage.defaultProps = {};

export default withRouter(StockListPage);
