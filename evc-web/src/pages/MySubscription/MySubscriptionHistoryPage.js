import { Layout, Space, Typography, Table } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { CheckOutlined } from '@ant-design/icons';
import { listMySubscriptionHistory } from 'services/subscriptionService';

const { Text, Title } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem;
  width: 100%;
  // max-width: 1000px;
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
      title: 'Plan',
      dataIndex: 'type',
      render: (value, item) => <>
        {getSubscriptionName(value)} {item.status === 'alive' && <Text type="success"><CheckOutlined /></Text>}
        {item.recurring && <><br/><Text type="secondary"><small>(auto renew)</small></Text></>}
      </>
    },
    {
      title: 'Selected Stocks',
      dataIndex: 'symbols',
      render: (value) => value.join(', ')
    },
    {
      title: 'Start',
      dataIndex: 'start',
      render: (value) => <TimeAgo value={value} showTime={false} />
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (value, item) => item.status === 'alive' && item.recurring ? null : <TimeAgo value={value} showTime={false} />
    },
  ];


  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
            <Title>Subscription History</Title>
            <Table
              loading={loading}
              style={{width: '100%'}}
              loading={loading}
              dataSource={list}
              columns={columnDef}
              size="small"
              pagination={false}
              rowKey="id"
            />
      </ContainerStyled>
    </LayoutStyled >
  );
};

MySubscriptionHistoryPage.propTypes = {};

MySubscriptionHistoryPage.defaultProps = {};

export default withRouter(MySubscriptionHistoryPage);
