import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, Table, Space, Row, Col } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { countUnreadMessage } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import InfiniteScroll from 'react-infinite-scroller';
import { withRouter } from 'react-router-dom';
import { Loading } from './Loading';
import { listHotStock } from 'services/stockService';
import Highlighter from "react-highlight-words";

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

const HotStockList = (props) => {

  const { size } = props;
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await listHotStock();
      setList(list);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleItemClick = item => {

  };

  const columnDef = [
    {
      title: 'Stock',
      render: (value, item) => <>
        {item.symbol}<br />
        <Text type="secondary"><small>{item.company}</small></Text>
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
  ];
  return (
    <Space direction="vertical" align="center">
      <Title level={3}>Most Searched</Title>
      <Table
        columns={columnDef}
        dataSource={list}
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
    </Space>

  );
};

HotStockList.propTypes = {
  size: PropTypes.number.isRequired,
};

HotStockList.defaultProps = {
  size: 10,
};

export default withRouter(HotStockList);
