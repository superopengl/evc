import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockEvcInfo } from 'services/stockService';
import ReactDOM from "react-dom";
import * as _ from 'lodash';
import styled from 'styled-components';
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { Loading } from './Loading';
import { Skeleton } from 'antd';

const { Text } = Typography;

const TooltipLabel = props => <Tooltip title={props.message}>
  <Text type="secondary"><small>{props.children}</small></Text>
</Tooltip>

const StockEvcInfoPanel = (props) => {

  const { symbol } = props;
  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStockEvcInfo(symbol) || {};
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <TooltipLabel message="How to use fair value">Fair Value</TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{width: 150}} active/> : <NumberRangeDisplay className="number" lo={data.fairValueLo} hi={data.fairValueHi} empty={<Text type="warning"><small>N/A Cannot calculate</small></Text>} />}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="How to use support">Support</TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{width: 150}} active/> : <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
          {data.supports?.map((s, i) => <NumberRangeDisplay className="number" key={i} lo={s.lo} hi={s.hi} />)}
        </Space>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="How to use resistance">Resistance</TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{width: 150}} active/> : <Space direction="vertical" size="small" style={{ alignItems: 'flex-end' }}>
          {data.resistances?.map((r, i) => <NumberRangeDisplay className="number" key={i} lo={r.lo} hi={r.hi} />)}
        </Space>}
      </Space>
    </Space>
  );
};

StockEvcInfoPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockEvcInfoPanel.defaultProps = {
};

export default withRouter(StockEvcInfoPanel);
