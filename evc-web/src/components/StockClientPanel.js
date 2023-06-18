import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Button, Tooltip, Modal, Tabs } from 'antd';
import { withRouter } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, LockFilled } from '@ant-design/icons';
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

const MemberOnlyIcon = () => <Text type="danger"><LockFilled/></Text>

const StockClientPanel = (props) => {

  const { value: stock } = props;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <StockName size={20} strong value={stock} />
      <Text type="secondary">Electronic Technology</Text>
      <StockChart symbol={stock.symbol} type="1d"/>
      <StockQuotePanel symbol={stock.symbol} />
      <Tabs type="card">
        <Tabs.TabPane key="1" tab={<>EVC Fair Value / Support / Resistance <MemberOnlyIcon /></>}>
          <StockInfoCard value={stock} />
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
  value: PropTypes.object.isRequired
};

StockClientPanel.defaultProps = {
};

export default withRouter(StockClientPanel);
