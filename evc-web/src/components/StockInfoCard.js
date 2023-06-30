import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Space, Row, Col, Tooltip, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { StarOutlined, StarFilled, QuestionCircleFilled } from '@ant-design/icons';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { StockWatchButton } from 'components/StockWatchButton';
import { StockName } from './StockName';
import { searchSingleStock, getStockHistory, getWatchList, unwatchStock, watchStock } from 'services/stockService';
import { GlobalContext } from '../contexts/GlobalContext';

const { Paragraph, Text } = Typography;


const TooltipLabel = props => <Tooltip title={props.message}>
  <Text type="secondary">{props.children}</Text>
</Tooltip>


const StockInfoCard = (props) => {

  const { value: stock, title, hoverable, actions } = props;

  const [watched, setWatched] = React.useState(stock?.watched);
  const context = React.useContext(GlobalContext);
  const { user, role, setUser, notifyCount } = context;
  const isClient = role === 'client';


  const handleWatchOrUnwatch = async watching => {
    if (watching) {
      await watchStock(stock.symbol);
    } else {
      await unwatchStock(stock.symbol);
    }
    setWatched(watching);
  }

  return (
    <Card
      size="small"
      bordered={false}
      type="inner"
      title={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
        {title ?? <StockName value={stock} />}
        {isClient && <StockWatchButton value={watched} onChange={handleWatchOrUnwatch} />}
      </Space>}
      onClick={props.onClick}
      hoverable={hoverable}
      actions={actions}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row>
          <Col span={10}>
            <TooltipLabel message="How to use fair value">Fair Value</TooltipLabel> 
            {/* <TooltipIcon message="How to use fair value" /> */}
          </Col>
          <Col span={14}>
            <NumberRangeDisplay lo={stock.fairValueLo} hi={stock.fairValueHi} loTrend={stock.fairValueLoTrend} hiTrend={stock.fairValueHiTrend} />
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <TooltipLabel message="How to use support">Support</TooltipLabel> 
            {/* <TooltipIcon message="How to use support" /> */}
          </Col>
          <Col span={14}>
            <Space size="small" direction="vertical">
              <NumberRangeDisplay lo={stock.supportShortLo} hi={stock.supportShortHi} loTrend={stock.supportShortLoTrend} hiTrend={stock.supportShortHiTrend} />
              <NumberRangeDisplay lo={stock.supportLongLo} hi={stock.supportLongHi} loTrend={stock.supportLongLoTrend} hiTrend={stock.supportLongHiTrend} />
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <TooltipLabel message="How to use resistance">Resistance</TooltipLabel> 
            {/* <TooltipIcon message="How to use resistance" /> */}
          </Col>
          <Col span={14}>
            <Space size="small" direction="vertical">
              <NumberRangeDisplay lo={stock.resistanceShortLo} hi={stock.resistanceShortHi} loTrend={stock.resistanceShortLoTrend} hiTrend={stock.resistanceShortHiTrend} />
              <NumberRangeDisplay lo={stock.resistanceLongLo} hi={stock.resistanceLongHi} loTrend={stock.resistanceLongLoTrend} hiTrend={stock.resistanceLongHiTrend} />
            </Space>
          </Col>
        </Row>
        <Row>
          <Col span={10}>
            <Text type="secondary">Published</Text>
          </Col>
          <Col span={14}>
            <TimeAgo value={stock.publishedAt} accurate={true} />
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

StockInfoCard.propTypes = {
  value: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  actions: PropTypes.array,
  title: PropTypes.object,
};

StockInfoCard.defaultProps = {
  title: null,
};

export default withRouter(StockInfoCard);
