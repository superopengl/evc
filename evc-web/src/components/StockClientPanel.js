import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Row, Col, Tooltip, Button, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, SyncOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
import StockInfoCard from './StockInfoCard';
import { StockName } from './StockName';
import { FaCrown } from 'react-icons/fa';
import { IconContext } from "react-icons";
import StockInsiderPanel from './StockInsiderPanel';
import StockNewsPanel from './StockNewsPanel';
import StockEarningsPanel from './StockEarningsPanel';
import StockChart from './charts/StockChart';
import StockQuotePanel from './StockQuotePanel';
const { Paragraph, Text } = Typography;

const MemberOnlyIcon = () => <Text type="danger"><LockFilled /></Text>

const StockClientPanel = (props) => {

  const { value: stock, onUnwatch } = props;
  const [key, setKey] = React.useState(0);

  const handleRefresh = () => {
    setKey(key + 1);
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} key={key}>
      <Text type="secondary">Electronic Technology</Text>
      <StockQuotePanel symbol={stock.symbol} />
      <Tabs type="card">
        <Tabs.TabPane key="1" tab={<>EVC Fair Value / Support / Resistance <MemberOnlyIcon /></>}>
          <StockInfoCard value={stock} />
        </Tabs.TabPane>
        <Tabs.TabPane key="6" tab={<>Chart</>}>
          <StockChart symbol={stock.symbol} type="1d" />
        </Tabs.TabPane>
        <Tabs.TabPane key="2" tab={<>Insider Transactions  <MemberOnlyIcon /></>}>
          <StockInsiderPanel symbol={stock.symbol} />
        </Tabs.TabPane>
        <Tabs.TabPane key="3" tab={<>Option Put-Call Ratio  <MemberOnlyIcon /></>}>
          前十高管持仓明细（Top Ten Insider Roster）：调用Insider Roster
          近6个月高管增持/减持汇总（last 6 Months Insider Transaction Summary）：调用Insider Summary
          最新高管增持/减持变更（latest Insider Transactions）：调用Insider Transactions

        </Tabs.TabPane>
        <Tabs.TabPane key="4" tab="Earnings Today">
          <StockEarningsPanel symbol={stock.symbol} />

        </Tabs.TabPane>
        <Tabs.TabPane key="5" tab="News">
          <StockNewsPanel symbol={stock.symbol} />
        </Tabs.TabPane>
      </Tabs>
    </Space>
  );
};

StockClientPanel.propTypes = {
  value: PropTypes.object.isRequired,
  onUnwatch: PropTypes.func,
};

StockClientPanel.defaultProps = {
};

export default withRouter(StockClientPanel);
