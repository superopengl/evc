import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Input, Layout, Modal, Select, Space, Table, Tooltip, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { countUnreadMessage } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import InfiniteScroll from 'react-infinite-scroller';
import { withRouter } from 'react-router-dom';
import { Loading } from './Loading';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

const StyledListItem = styled.div`
display: flex;
width: 100%;
justify-content: space-between;
margin: 0;
padding: 0.5rem 0.1rem 0.5rem 0;
border-bottom: 1px solid #f3f3f3;
align-items: flex-start;
cursor: pointer;

&:hover {
  background-color: rgba(0,0,0,0.03);
}

.ant-typography {
  margin-bottom: 2px;
}

`;

const StockList = (props) => {

  const { onFetchNextPage, size, max } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [text, setText] = React.useState('');
  const context = React.useContext(GlobalContext);

  const { role } = context;
  const isClient = role === 'client';

  const initloadList = async () => {
    setLoading(true);
    await handleFetchNextPageData(size);
    const count = await countUnreadMessage();
    context.setNotifyCount(count);
    setLoading(false);
  }

  React.useEffect(() => {
    initloadList();
  }, []);

  const handleFetchNextPageData = async () => {
    // const data = await listNotification(page, pageSize);
    const data = await onFetchNextPage(page, size);
    const newList = [...list, ...data];

    setList(max ? newList.slice(0, max) : newList);
    setPage(page + 1);

    const shouldStopLoading = data.length < size || (max && newList.length >= max);
    setHasMore(!shouldStopLoading);
  }

  const handleItemClick = (item) => {
    const { symbol } = item;
    props.history.push(`/stock/${symbol}`);
  }

  const handleDelete = () => {

  }

  const columnDef = [
    {
      title: 'Stock',
      // onFilter: (value, record) => record.name.includes(value),
      render: (value, item) => <>
        <Highlighter highlightClassName="search-highlighting" searchWords={[text]} autoEscape={false} textToHighlight={item.symbol} /><br/>
        <Text type="secondary"><small><Highlighter highlightClassName="search-highlighting" searchWords={[text]} autoEscape={false} textToHighlight={item.company} /></small></Text>
      </>,
    },
    {
      title: 'PE',
      render: (text, item) => <>{item.peLo} - {item.peHi}</>
    },
    {
      title: 'Value',
      render: (text, item) => <>{item.value}</>
    },
    {
      title: 'Support',
      render: (text, item) => <>{item.supportPriceLo} - {item.supportPriceHi}</>
    },
    {
      title: 'Pressure',
      render: (text, item) => <>{item.pressurePriceLo} - {item.pressurePriceHi}</>
    },
    {
      title: 'Last Updated',
      dataIndex: 'createdAt',
      render: (text) => {
        return <TimeAgo value={text} accurate={false}/>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'publised',
      render: (value) => {
        return value ? 'Published' : 'Saved'
      }
    },
    // {
    //   title: 'Action',
    //   render: (text, record) => (
    //     <Space size="small">
    //       <Tooltip placement="bottom" title="Proceed task">
    //         <Link to={`/tasks/${record.id}/proceed`}><Button shape="circle" icon={<EditOutlined />}></Button></Link>
    //       </Tooltip>
    //       <Tooltip placement="bottom" title="Delete task">
    //         <Button shape="circle" danger onClick={e => handleDelete(e, record)} icon={<DeleteOutlined />}></Button>
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <InfiniteScroll
      initialLoad={true}
      pageStart={0}
      loadMore={() => handleFetchNextPageData()}
      hasMore={!loading && hasMore}
      useWindow={true}
      loader={<Space key="loader" style={{ width: '100%', justifyContent: 'center' }}><Loading /></Space>}
    >
      <Table
        columns={columnDef}
        dataSource={list}
        // scroll={{x: 1000}}
        rowKey="symbol"
        size="small"
        loading={loading}
        pagination={false}
        // onChange={handleTableChange}
        // rowClassName={(record) => record.lastUnreadMessageAt ? 'unread' : ''}
        onRow={(item) => ({
          onDoubleClick: () => {
            handleItemClick(item);
          }
        })}
      />
    </InfiniteScroll>
  );
};

StockList.propTypes = {
  size: PropTypes.number.isRequired,
  onItemRead: PropTypes.func.isRequired,
  onFetchNextPage: PropTypes.func.isRequired,
  max: PropTypes.number,
};

StockList.defaultProps = {
  size: 20,
  onItemRead: () => { },
};

export default withRouter(StockList);
