import { Tag, Space, Typography, Table, List, Drawer, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { CheckOutlined } from '@ant-design/icons';
import { listMySubscriptionHistory } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MdAutorenew } from 'react-icons/md';
import MoneyAmount from 'components/MoneyAmount';

const { Text, Link } = Typography;

const MySubscriptionHistoryDrawer = (props) => {
  const { visible: propVisible } = props;
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
    if (propVisible) {
      loadSubscrptions();
    }
  }, [propVisible]);

  const columnDef = [
    {
      title: 'Subscription type',
      render: (value, item) => <Space>
        <Text strong={item.status === 'alive'}>
          {getSubscriptionName(item.type)}
        </Text>
        {item.status === 'alive' && <Tag color="warning">Current</Tag>}
      </Space>
    },
    {
      title: 'Subscription period',
      align: 'left',
      render: (value, item) => {
        return <Space>
          {item.recurring && <Tag color="success">Auto renew</Tag>}
          <TimeAgo value={item.start} showAgo={false} accurate={false} />
          <ArrowRightOutlined />
          {/* <DoubleRightOutlined /> */}
          <TimeAgo value={item.end} showAgo={false} accurate={false} />
        </Space>
      }
    },
    {
      title: 'Billings',
      dataIndex: 'payments',
      align: 'center',
      render: (payments, item) => {
        return <Table
          columns={[
            {
              title: 'link',
              dataIndex: 'amount',
              align: 'right',
              width: '33%',
              render: (amount, item) => <MoneyAmount value={amount} />
            },
            {
              title: 'link',
              dataIndex: 'createdAt',
              align: 'right',
              width: '33%',
              render: (createdAt, item) => <TimeAgo value={createdAt} showAgo={false} accurate={false} />
            },
            {
              title: 'link',
              dataIndex: 'id',
              width: '33%',
              align: 'right',
              render: (id, item) => <Button type="link">Invoice</Button>
            },
          ]}
          bordered={false}
          showHeader={false}
          dataSource={payments}
          pagination={false}
          style={{ width: '100%' }}
        />
      }
    },
  ];


  return (
    <Drawer
      title="Billing Information"
      width="80vw"
      destroyOnClose={true}
      maskClosable={true}
      {...props}
    >
      <Table
        // showHeader={false}
        loading={loading}
        style={{ width: '100%' }}
        dataSource={list}
        columns={columnDef}
        size="small"
        pagination={false}
        rowKey="id"
        bordered={false}
      />
    </Drawer>
  );
};

MySubscriptionHistoryDrawer.propTypes = {};

MySubscriptionHistoryDrawer.defaultProps = {};

export default withRouter(MySubscriptionHistoryDrawer);
