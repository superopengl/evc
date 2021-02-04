import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, List, Tooltip, Descriptions, Tag, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { getStockInsider } from 'services/stockService';
import { Loading } from './Loading';
import styled from 'styled-components';
import INSIDER_LEGEND_INFOS from '../def/insiderLegendDef';

const { Paragraph, Text, Title } = Typography;

const RosterList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`;

const RosterCard = styled(Card)`
.ant-card-body {
  padding: 12px;
}
`;

const Container = styled(Space)`
.ant-descriptions-title {
  color: #3273A4 !important;
}

.ant-descriptions-header {
  margin: 0;
}

.ant-descriptions-item {
  padding-bottom: 2px !important;
}
`;

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
    const info = INSIDER_LEGEND_INFOS[transactionType];
    return <Tooltip title={info.message}>
      <Tag color={info.color}>{transactionType}</Tag>
    </Tooltip>
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Loading loading={loading}>
      <Container direction="vertical" size="small" style={{ width: '100%' }}>
        <Title level={3}>Roster</Title>
        <RosterList
          grid={{
            gutter: 10,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 4
          }}
          itemLayout="horizontal"
          size="small"
          dataSource={data.roster}
          renderItem={item => (
            <List.Item>
              <RosterCard card="small">
                <Descriptions
                  title={item.entityName}
                  size="small"
                  extra={item.position.toLocaleString()}
                ></Descriptions>
              </RosterCard>
            </List.Item>
          )}
        />
        <Title level={3}>Summary</Title>
        <RosterList
          grid={{ column: 1 }}
          itemLayout="horizontal"
          size="small"
          dataSource={data.summary}
          renderItem={item => (
            <List.Item>
              <Card size="small">
                <Descriptions
                  title={<Space>{item.fullName} {item.reportedTitle && <Text type="secondary" style={{fontWeight: 400, fontSize: '0.8rem'}}>{item.reportedTitle}</Text>}</Space>}
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
              </Card>
            </List.Item>
          )}
        />
      </Container>
    </Loading>
  );
};

StockInsiderPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockInsiderPanel.defaultProps = {
};

export default withRouter(StockInsiderPanel);
