import { Layout, Space, Typography, Table, Tooltip } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { CheckOutlined } from '@ant-design/icons';
import { listMySubscriptionHistory } from 'services/subscriptionService';
import { DoubleRightOutlined, ArrowRightOutlined, RetweetOutlined } from '@ant-design/icons';
import { MdAutorenew } from 'react-icons/md';

const { Text, Title } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .ant-divider {
  //   margin: 20px 0 8px;
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
`;



const MySubscriptionHistoryPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);

      const account = await listMySubscriptionHistory();
      setList(account);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubscrptions();
  }, []);

  const columnDef = [
    {
      render: (value, item) => <>
        {getSubscriptionName(item.type)}
        {item.symbols?.length > 0 && <div><Text type="secondary"><small>{item.symbols.join(', ')}</small></Text></div>}
      </>
    },
    {
      title: 'Status',
      align: 'center',
      render: (value, item) => <>
        {item.recurring && <Tooltip title="Auto renew"><MdAutorenew /></Tooltip>}
        {item.status === 'alive' && <Tooltip title="Current alive subscription"><Text type="success"><CheckOutlined /></Text></Tooltip>}
      </>
    },
    {
      align: 'right',
      render: (value, item) => {
        return <Space size="large">
          <TimeAgo value={item.start} />
          <ArrowRightOutlined />
          {/* <DoubleRightOutlined /> */}
          {item.status === 'alive' && item.recurring ? null : <TimeAgo value={item.end} />}
        </Space>
      }
    },

  ];


  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Title>Subscription History</Title>
        <Table
          showHeader={false}
          loading={loading}
          style={{ width: '100%' }}
          dataSource={list}
          columns={columnDef}
          size="small"
          pagination={false}
          rowKey="id"
          bordered={false}
        />
      </ContainerStyled>
    </LayoutStyled >
  );
};

MySubscriptionHistoryPage.propTypes = {};

MySubscriptionHistoryPage.defaultProps = {};

export default withRouter(MySubscriptionHistoryPage);
