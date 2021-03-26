import { Layout, Space, Typography, List, Tag, Drawer, Descriptions } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { CheckOutlined } from '@ant-design/icons';
import { listMySubscriptionHistory } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import { MdAutorenew } from 'react-icons/md';
import { listMyCommissionWithdrawal } from 'services/commissionService';
import countryList from 'react-select-country-list'

const country = countryList();

const { Text } = Typography;

const MyCommissionWithdrawalHistoryDrawer = (props) => {
  const { visible } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);

      const list = await listMyCommissionWithdrawal();
      setList(list);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (visible) {
      loadSubscrptions();
    }
  }, [visible]);

  const getIdLabel = (identityType) => {
    switch (identityType) {
      case 'id':
        return 'ID'
      case 'passport':
        return 'Passport';
      case 'driver':
        return 'Driver License';
      default:
        return 'Unknown'
    }
  }

  const getStatusTag = (status) => {
    switch (status) {
      case 'submitted':
        return <Tag color="processing">Processing</Tag>
      case 'rejected':
        return <Tag color="error">Rejected</Tag>
      case 'done':
        return <Tag color="success">Done</Tag>
      default:
        return 'Unknown'
    }
  }

  return (
    <Drawer
      title="Commission Withdrawal Applications"
      width="80vw"
      destroyOnClose={true}
      maskClosable={true}
      {...props}
    >
      <List
        title={false}
        loading={loading}
        grid={{
          column: 1
        }}
        dataSource={list}
        size="small"
        renderItem={item => {
          return <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Descriptions
              style={{ width: '100%' }}
              bordered
              size="small"
              column={{
                xxl: 4,
                xl: 3,
                lg: 3,
                md: 3,
                sm: 2,
                xs: 1
              }}
            >
              <Descriptions.Item label="ID" span={2}><Text code>{item.id}</Text></Descriptions.Item>
              <Descriptions.Item label="Created At"><TimeAgo value={item.createdAt} /></Descriptions.Item>
              <Descriptions.Item label="Amount">$ {item.amount.toFixed(2)} USD</Descriptions.Item>
              <Descriptions.Item label="PayPal Account">{item.payPalAccount}</Descriptions.Item>
              <Descriptions.Item label="Name">{item.givenName} {item.surname}</Descriptions.Item>
              <Descriptions.Item label="Citizenship">{country.getLabel(item.citizenship)}</Descriptions.Item>
              <Descriptions.Item label="Resident Address">{item.address} {country.getLabel(item.country)}</Descriptions.Item>
              <Descriptions.Item label="Phone">{item.phone}</Descriptions.Item>
              <Descriptions.Item label="Identity">{getIdLabel(item.identityType)} {item.identityNumber}</Descriptions.Item>
              <Descriptions.Item label="Official Handled At"><TimeAgo value={item.handledAt} /></Descriptions.Item>
              <Descriptions.Item label="Result" span={2}>{getStatusTag(item.status)} {item.handledResult}</Descriptions.Item>
            </Descriptions>
          </List.Item>
        }}
      />
    </Drawer>
  );
};

MyCommissionWithdrawalHistoryDrawer.propTypes = {};

MyCommissionWithdrawalHistoryDrawer.defaultProps = {};

export default withRouter(MyCommissionWithdrawalHistoryDrawer);
