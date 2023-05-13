import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Typography, List, Space, Row, Col } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { countUnreadMessage } from 'services/messageService';
import { GlobalContext } from 'contexts/GlobalContext';
import InfiniteScroll from 'react-infinite-scroller';
import { withRouter } from 'react-router-dom';
import { Loading } from './Loading';

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

  return (
    <InfiniteScroll
      initialLoad={true}
      pageStart={0}
      loadMore={() => handleFetchNextPageData()}
      hasMore={!loading && hasMore}
      useWindow={true}
      loader={<Space key="loader" style={{ width: '100%', justifyContent: 'center' }}><Loading /></Space>}
    >
      <List
        itemLayout="horizontal"
        dataSource={list}
        size="small"
        // style={{ marginTop: '1rem' }}
        // renderItem={item => (<StyledListItem
        //   onClick={() => handleItemClick(item)}
        // >
        //   {/* {!item.readAt && <Badge color="geekblue" style={{visibility: item.readAt ?  'hidden' : 'visible'}} />} */}
        //     <Paragraph ellipsis={{ rows: 1, expandable: false }} style={{ fontWeight: item.readAt ? 400: 800 }}>
        //       {item.symbol}
        //     </Paragraph>
        //     <Paragraph type="secondary" ellipsis={{ rows: 1, expandable: false }} style={{ fontSize: '0.9rem', fontWeight: item.readAt ? 200 : 600 }}>
        //       {item.company}
        //     </Paragraph>
        //   {/* <TimeAgo value={item.createdAt} /> */}
        // </StyledListItem>
        // )}
        renderItem={item => (
          <List.Item onClick={() => handleItemClick(item)}>
            <List.Item.Meta
              // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
              title={<Title level={5}>{item.company} ({item.symbol})</Title>}
              description={<>
                <Row>
                  <Col span={6}>
                    <Paragraph>PE</Paragraph> <Paragraph>{item.peLo} - {item.peHi}</Paragraph>
                  </Col>
                  <Col span={6}>
                    <Paragraph>Value</Paragraph> <Paragraph>{item.value}</Paragraph>
                  </Col>
                  <Col span={6}>
                    <Paragraph>Support Price</Paragraph> <Paragraph>{item.supportPriceLo} - {item.supportPriceHi}</Paragraph>
                  </Col>
                  <Col span={6}>
                    <Paragraph>Pressure Price</Paragraph> <Paragraph>{item.pressurePriceLo} - {item.pressurePriceHi}</Paragraph>
                  </Col>
                </Row>
              </>}
            />

          </List.Item>
        )}
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
