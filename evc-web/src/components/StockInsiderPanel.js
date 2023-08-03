import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, List, Tooltip, Descriptions, Table, Tag } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockInsider } from 'services/stockService';
import { Loading } from './Loading';
const { Paragraph, Text, Title } = Typography;

const BADGE_INFOS = {
  'A': {
    color: '#333333',
    message: 'Grant, award, or other acquisition of securities from the company (such as an option)'
  },
  'P': {
    color: '#3b5999',
    message: 'Purchase of securities on an exchange or from another person'
  },
  'S': {
    color: '#108ee9',
    message: 'Sale of securities on an exchange or to another person'
  },
  'M': {
    color: '#f05000',
    message: 'Exercise or conversion of derivative security received from the company (such as an option)'
  },
  'G': {
    color: '#87d068',
    message: 'Gift of securities by or to the insider'
  },
};

const StockInsiderPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setData(await getStockInsider(symbol));
    } finally {
      setLoading(false);
    }
  }

  const getBadgeComponent = (transactionType) => {
    const info = BADGE_INFOS[transactionType];
    return <Tooltip title={info.message}>
      <Tag color={info.color}>{transactionType}</Tag>
    </Tooltip>
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
      <Loading loading={loading}>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3}>Roster</Title>
        <List
          itemLayout="horizontal"
          size="small"
          dataSource={data.roster}
          renderItem={item => (
            <List.Item>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text strong>{item.entityName}</Text>
                <Text type="secondary">{item.position.toLocaleString()}</Text>
              </Space>
            </List.Item>
          )}
        />
        <Title level={3}>Summary</Title>
        <Space direction="vertical" size="small">
          {Object.entries(BADGE_INFOS).map(([k, v]) => <div key={k}>
            {getBadgeComponent(k)}
            {v.message}
          </div>)}
        </Space>
        <List
          itemLayout="horizontal"
          size="small"
          dataSource={data.summary}
          renderItem={item => (
            <List.Item>
              <Descriptions
                title={<>{item.fullName} {item.reportedTitle && <Text type="secondary"><small>{item.reportedTitle}</small></Text>}</>}
                size="small"
                extra={getBadgeComponent(item.transactionCode)}
              >
                <Descriptions.Item label="Exercise price">{item.conversionOrExercisePrice}</Descriptions.Item>
                <Descriptions.Item label="Filing date">{item.filingDate}</Descriptions.Item>
                <Descriptions.Item label="Post shares">{item.postShares?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction date">{item.transactionDate}</Descriptions.Item>
                <Descriptions.Item label="Transaction price">{item.transactionPrice?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction shares">{item.transactionShares?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction value">{item.transactionValue?.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </List.Item>
          )}
        />
    </Space>
      </Loading>
  );
};

StockInsiderPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockInsiderPanel.defaultProps = {
};

export default withRouter(StockInsiderPanel);
