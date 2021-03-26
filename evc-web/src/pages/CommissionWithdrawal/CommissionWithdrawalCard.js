import { Typography, Tag, Descriptions } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { TimeAgo } from 'components/TimeAgo';
import countryList from 'react-select-country-list'
import PropTypes from 'prop-types';
import MoneyAmount from 'components/MoneyAmount';


const country = countryList();

const { Text } = Typography;

const CommissionWithdrawalCard = (props) => {
  const { value, grid } = props;

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
    <Descriptions
      style={{ width: '100%', backgroundColor: 'white' }}
      bordered
      size="small"
      column={grid}
    >
      <Descriptions.Item label="Status" span={2}>{getStatusTag(value.status)} {value.handledResult}</Descriptions.Item>
      <Descriptions.Item label="Amount"><MoneyAmount value={value.amount} postfix="USD" strong /></Descriptions.Item>
      <Descriptions.Item label="Reference ID" span={2}><Text code>{value.id}</Text></Descriptions.Item>
      <Descriptions.Item label="PayPal Account">{value.payPalAccount}</Descriptions.Item>
      <Descriptions.Item label="Name">{value.givenName} {value.surname}</Descriptions.Item>
      <Descriptions.Item label="Citizenship">{country.getLabel(value.citizenship)}</Descriptions.Item>
      <Descriptions.Item label="Resident Address">{value.address} {country.getLabel(value.country)}</Descriptions.Item>
      <Descriptions.Item label="Phone">{value.phone}</Descriptions.Item>
      <Descriptions.Item label="Identity">{getIdLabel(value.identityType)} {value.identityNumber}</Descriptions.Item>
      <Descriptions.Item label="Created At"><TimeAgo value={value.createdAt} /></Descriptions.Item>
      <Descriptions.Item label="Completed At"><TimeAgo value={value.handledAt} /></Descriptions.Item>
    </Descriptions>
  )
};

CommissionWithdrawalCard.propTypes = {
  value: PropTypes.object.isRequired,
  grid: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
};

CommissionWithdrawalCard.defaultProps = {
  grid: {
    xxl: 4,
    xl: 3,
    lg: 3,
    md: 3,
    sm: 2,
    xs: 1
  }
};

export default withRouter(CommissionWithdrawalCard);
