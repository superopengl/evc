import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Listy, Tooltip, Descriptions, Tag } from 'antd';
import { withRouter } from 'util/withRouter';
import { getStockInsiderTransaction } from 'services/stockService';
import { Loading } from './Loading';
import styled from 'styled-components';
import INSIDER_LEGEND_INFOS from '../def/insiderLegendDef';
import { from } from 'rxjs';
import dayjs from 'util/dayjs';

const { Text } = Typography;

// List -> Listy: `grid={{column: 1}}` was a plain vertical stack, and the styled(List)
// wrapper only zeroed the item's horizontal padding - styles.item does that directly.
const ITEM_STYLE = { paddingInline: 0, paddingBlock: 8 };

// The rows come out of a JSON blob (StockInsiderTransaction.value) with no id of their own,
// so Listy's required rowKey has to be composed from the fields that identify a filing.
const rosterRowKey = item =>
  `${item.fullName}.${item.filingDate}.${item.transactionDate}.${item.transactionCode}.${item.transactionShares}`;


const Container = styled(Space)`
.ant-descriptions-title {
  font-size: 14px;
  // color: #3273A4 !important;
}

.ant-descriptions-item-label {
  font-size: 0.9rem;
  color: rgba(0,0,0,0.45);
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
  sm: 2,
  md: 2,
  lg: 1,
  xl: 2,
  xxl: 3
};

const StockInsiderTransactionPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockInsiderTransaction(symbol) ?? [];
      setData(data);
      setLoading(false);
      
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
    const load$ = from(loadData()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString, 'YYYY-MM-DD').format('ll') : null;
  }

  return (
    <Loading loading={loading}>
      <Container orientation="vertical" size="small" style={{ width: '100%' }}>
        <Space orientation="vertical" size="small" style={{ marginBottom: 24 }}>
          {Object.entries(INSIDER_LEGEND_INFOS).map(([k, v]) => <div key={k}>
            <Tag color={v.color}>{k}</Tag>
            {v.message}
          </div>)}
        </Space>
        <Listy
          items={data}
          rowKey={rosterRowKey}
          styles={{ item: ITEM_STYLE }}
          itemRender={item => (
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
          )}
        />
      </Container>
    </Loading>
  );
};

StockInsiderTransactionPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

export default withRouter(StockInsiderTransactionPanel);
