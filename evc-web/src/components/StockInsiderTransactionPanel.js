import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, List, Tooltip, Descriptions, Tag } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockInsider } from 'services/stockService';
import { Loading } from './Loading';
import styled from 'styled-components';
import INSIDER_LEGEND_INFOS from '../def/insiderLegendDef';
import * as moment from 'moment';
import ReactDOM from 'react-dom';

const { Text } = Typography;

const RosterList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`;


const Container = styled(Space)`
.ant-descriptions-title {
  font-size: 14px;
  color: #3273A4 !important;
}

.ant-descriptions-header {
  margin: 0;
}

.ant-descriptions-item {
  padding-bottom: 2px !important;
}
`;

const span = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 2,
  xl: 2,
  xxl: 3
};

const StockInsiderTransactionPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockInsider(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  const getBadgeComponent = (transactionType) => {
    const info = INSIDER_LEGEND_INFOS[transactionType];
    if (!info) return null;
    return <Tooltip title={info?.message ?? transactionType}>
      <Tag color={info?.color ?? '#888888'}>{transactionType}</Tag>
    </Tooltip>
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString) => {
    return dateString ? moment(dateString, 'YYYY-MM-DD').format('DD MMM YYYY') : null;
  }

  return (
    <Loading loading={loading}>
      <Container direction="vertical" size="small" style={{ width: '100%' }}>
        <Space direction="vertical" size="small" style={{ marginBottom: 24 }}>
          {Object.entries(INSIDER_LEGEND_INFOS).map(([k, v]) => <div key={k}>
            <Tag color={v.color}>{k}</Tag>
            {v.message}
          </div>)}
        </Space>
        <RosterList
          grid={{ column: 1 }}
          itemLayout="horizontal"
          size="small"
          dataSource={data.summary.reverse()}
          renderItem={item => (
            <List.Item>
              <Descriptions
                title={<Space>{item.fullName} {item.reportedTitle && <Text type="secondary" style={{ fontWeight: 400, fontSize: '0.8rem' }}>{item.reportedTitle}</Text>}</Space>}
                size="small"
                column={span}
                extra={getBadgeComponent(item.transactionCode)}
              >
                <Descriptions.Item label="Exercise price">{item.conversionOrExercisePrice}</Descriptions.Item>
                <Descriptions.Item label="Filing date">{formatDate(item.filingDate)}</Descriptions.Item>
                <Descriptions.Item label="Post shares">{item.postShares?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction date">{formatDate(item.transactionDate)}</Descriptions.Item>
                <Descriptions.Item label="Transaction price">{item.transactionPrice?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction shares">{item.transactionShares?.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Transaction value">{item.transactionValue?.toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </List.Item>
          )}
        />
      </Container>
    </Loading>
  );
};

StockInsiderTransactionPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockInsiderTransactionPanel.defaultProps = {
};

export default withRouter(StockInsiderTransactionPanel);
