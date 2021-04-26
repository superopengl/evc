import { Tag, Space, Typography, Table, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadReceipt, listMySubscriptionHistory } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import MoneyAmount from 'components/MoneyAmount';
import { orderBy } from 'lodash';
import * as moment from 'moment';

const { Text, Link } = Typography;

const MySubscriptionHistoryPanel = (props) => {
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const load = async () => {
    try {
      setLoading(true);

      setList(await listMySubscriptionHistory());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const handleReceipt = async (payment) => {
    const data = await downloadReceipt(payment.id);
    const fileUrl = URL.createObjectURL(data);
    window.open(fileUrl);
  }

  const columnDef = [
    {
      title: 'Subscription period',
      align: 'left',
      width: 370,
      render: (value, item) => {
        return <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <TimeAgo value={item.start} showAgo={false} accurate={false} />
            <ArrowRightOutlined />
            {/* <DoubleRightOutlined /> */}
            <TimeAgo value={item.end} showAgo={false} accurate={false} />
            {item.recurring && <>(auto renew)</>}
          </Space>

          {moment().isAfter(moment(item.start).startOf('day')) && moment().isBefore(moment(item.end).endOf('day')) && <Tag color="success"><strong>Current</strong></Tag>}
          {moment().isBefore(moment(item.start).startOf('day')) && <Tag>Furture</Tag>}
        </Space>
      }
    },
    {
      title: 'Billing',
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
              render: (id, item) => <Button type="link" onClick={() => handleReceipt(item)} icon={<DownloadOutlined />}>Receipt</Button>
            },
          ]}
          bordered={true}
          rowKey="id"
          showHeader={false}
          dataSource={orderBy(payments, [x => moment(x.paidAt).toDate()], 'desc')}
          pagination={false}
          scroll={false}
          style={{ width: '100%', minWidth: 370 }}
        />
      }
    },
  ];

  return (
    <Table
      // showHeader={false}
      showHeader={true}
      loading={loading}
      style={{ width: '100%' }}
      scroll={{ x: false, y: 300 }}
      dataSource={list}
      columns={columnDef}
      size="small"
      pagination={false}
      rowKey="id"
      bordered={false}
    />
  );
};

MySubscriptionHistoryPanel.propTypes = {};

MySubscriptionHistoryPanel.defaultProps = {};

export default withRouter(MySubscriptionHistoryPanel);
