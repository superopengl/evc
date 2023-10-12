import { Layout, Space, Typography, Table, Tooltip, Drawer } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { CheckOutlined } from '@ant-design/icons';
import { listMySubscriptionHistory } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MdAutorenew } from 'react-icons/md';

const { Text } = Typography;

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
    <Drawer
      title="Subscription History"
      width="80vw"
      destroyOnClose={true}
      maskClosable={true}
      {...props}
    >
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
    </Drawer>
  );
};

MySubscriptionHistoryDrawer.propTypes = {};

MySubscriptionHistoryDrawer.defaultProps = {};

export default withRouter(MySubscriptionHistoryDrawer);
