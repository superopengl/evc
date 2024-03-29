import { Tag, Space, Table, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadReceipt } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import MoneyAmount from 'components/MoneyAmount';
import orderBy from 'lodash/orderBy';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledPaymentTable = styled(Table)`
.ant-table {
  margin-left: -8px !important;
}
`;

const MySubscriptionHistoryPanel = (props) => {
  const { data } = props;
  const [list, setList] = React.useState(data || []);

  React.useEffect(() => {
    setList(data);
  }, [data]);

  const handleReceipt = async (payment) => {
    const data = await downloadReceipt(payment.id);
    const fileUrl = URL.createObjectURL(data);
    window.open(fileUrl);
  }

  const columnDef = [
    {
      title: 'Subscription period',
      align: 'left',
      render: (value, item) => {
        return <Space>
          <TimeAgo value={item.start} showAgo={false} accurate={false} />
          <ArrowRightOutlined />
          {/* <DoubleRightOutlined /> */}
          <TimeAgo value={item.end} showAgo={false} accurate={false} />
          {item.status === 'alive' && item.recurring && <Tag>auto renew</Tag>}
          {item.status === 'alive' && <Tag color="#57BB60"><strong>current</strong></Tag>}
          {/* {moment(item.createdAt).isAfter(moment()) && <Tag color="warning">new purchase</Tag>} */}
          {/* {moment().isBefore(moment(item.start).startOf('day')) && <Tag>Furture</Tag>} */}
        </Space>
      }
    },
    {
      title: 'Billing',
      dataIndex: 'payments',
      align: 'center',
      width: 370,
      render: (payments, item) => {
        return <StyledPaymentTable
          columns={[
            {
              title: 'link',
              dataIndex: 'amount',
              align: 'center',
              width: '33%',
              render: (amount, item) => <MoneyAmount value={item.amountCny ?? amount} symbol={item.amountCny ? '¥' : '$'} />
            },
            {
              title: 'link',
              dataIndex: 'createdAt',
              align: 'center',
              width: '33%',
              render: (createdAt, item) => <TimeAgo value={createdAt} showAgo={false} accurate={false} />
            },
            {
              title: 'link',
              dataIndex: 'id',
              width: '34%',
              align: 'center',
              render: (id, item) => <Button type="link" onClick={() => handleReceipt(item)} icon={<DownloadOutlined />}>Receipt</Button>
            },
          ]}
          bordered={true}
          rowKey="id"
          showHeader={false}
          dataSource={orderBy(payments, [x => moment(x.paidAt).toDate()], 'asc')}
          pagination={false}
          scroll={false}
        />
      }
    },
  ];

  return (
    <Table
      // showHeader={false}
      showHeader={true}
      style={{ width: '100%' }}
      scroll={{ x: 'max-content' }}
      dataSource={list}
      columns={columnDef}
      size="small"
      pagination={false}
      rowKey="id"
      bordered={false}
    />
  );
};

MySubscriptionHistoryPanel.propTypes = {
  data: PropTypes.array.isRequired
};

MySubscriptionHistoryPanel.defaultProps = {
  data: []
};

export default withRouter(MySubscriptionHistoryPanel);
