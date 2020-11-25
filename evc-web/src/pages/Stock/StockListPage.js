import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Space, Button, Input, Form, Modal } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { listMessages } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import StockList from '../../components/StockList';
import { saveStock, searchStock } from 'services/stockService';
import { withRouter } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroller';
import { Loading } from 'components/Loading';
import StockTagSelect from 'components/StockTagSelect';
import { Divider } from 'antd';

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
  page: 1,
  size: 50,
  total: 0,
  saved: true,
  published: true,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};


const size = 50;

const StockListPage = (props) => {

  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [text, setText] = React.useState('');
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    fetchListByPage(0);
  }, []);

  const fetchListByPage = async (page) => {
    setLoading(true);
    try {
      const data = await searchStock({ ...queryInfo, page, size })
      setList(data);
      setPage(page + 1);
      const shouldStopLoading = data.length < size;
      setHasMore(!shouldStopLoading);
    } finally {
      setLoading(false);
    }
  }

  const handleFetchNextPageData = async () => {
    await fetchListByPage(page);
  }

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
      await saveStock(stock);

      props.history.push(`/stock/${stock.symbol.toUpperCase()}`)
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = async (value) => {
    fetchListByPage(0);
  }

  const handleSearchChange = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }
    updateQueryInfo(newQueryInfo);
  }

  const updateQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject('query', queryInfo);
    setQueryInfo(queryInfo);
  }

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
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
          <Divider/>
          <InfiniteScroll
            initialLoad={true}
            pageStart={0}
            loadMore={() => handleFetchNextPageData()}
            hasMore={!loading && hasMore}
            useWindow={true}
            loader={<Space key="loader" style={{ width: '100%', justifyContent: 'center' }}><Loading /></Space>}
          >
            <StockList data={list} />
          </InfiniteScroll>
        </Space>
      </ContainerStyled>
      <Modal
        visible={visible}
        closable={true}
        maskClosable={false}
        destroyOnClose={true}
        title="New Stock"
        footer={null}
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
            <Form.Item label="Tags" name="tags" rules={[{ required: false }]}>
              <StockTagSelect />
            </Form.Item>
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
