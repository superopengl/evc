import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockEvcInfo } from 'services/stockService';
import ReactDOM from "react-dom";
import { NumberRangeDisplay } from './NumberRangeDisplay';
import { Skeleton } from 'antd';
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

const { Text } = Typography;

const TooltipLabel = props => <Text type="secondary">{props.children}</Text>
const SHOW_SUPPORT_RESISTANCE = false;


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
    const load$ = from(loadData()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel>
          <FormattedMessage id="text.reportDate" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <Text>{moment(data.fairValueDate).format('D MMM YYYY')}</Text>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <TooltipLabel message="How to use fair value">
          <FormattedMessage id="text.fairValue" />
        </TooltipLabel>
        {loading ?
          <Skeleton.Input size="small" style={{ width: 150 }} active /> :
          <NumberRangeDisplay className="number"
            lo={data.fairValueLo}
            hi={data.fairValueHi}
            empty={data.isLoss ? <Text type="danger"><FormattedMessage id="text.loss" /></Text> : <Text type="warning"><small>N/A</small></Text>} />
        }
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.forwardNextFyFairValue" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <NumberRangeDisplay className="number"
            lo={data.forwardNextFyFairValueLo}
            hi={data.forwardNextFyFairValueHi}
            empty={data.isForwardNextFyFairValueLoss ?
              <Text type="danger"><small><FormattedMessage id="text.forwardNextFyFairValueLoss" /></small></Text> :
              <Text type="warning"><small>N/A</small></Text>}
          />
        </div>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.forwardNextFyMaxValue" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <NumberRangeDisplay className="number"
            lo={data.forwardNextFyMaxValueLo}
            hi={data.forwardNextFyMaxValueHi}
            empty={data.isForwardNextFyMaxValueLoss ?
              <Text type="danger"><small><FormattedMessage id="text.forwardNextFyFairValueLoss" /></small></Text> :
              <Text type="warning"><small>N/A</small></Text>}
          />
        </div>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.beta" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {data.bata ? <Text>{data.beta}</Text> : <Text type="warning"><small>NONE</small></Text>}
        </div>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.peRatio" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {data.peRatio ? <Text>{(+data.peRatio).toFixed(2)}</Text> : <Text type="warning"><small>NONE</small></Text>}
        </div>}
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.pegRatio" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {data.pegRatio ? <Text>{(+data.pegRatio).toFixed(2)}</Text> : <Text type="warning"><small>NONE</small></Text>}
        </div>}
      </Space>
      {SHOW_SUPPORT_RESISTANCE && <>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TooltipLabel message="How to use support">
            <FormattedMessage id="text.support" />
          </TooltipLabel>
          {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {data.supports?.map((s, i) => <NumberRangeDisplay className="number" key={i} lo={s.lo} hi={s.hi} />)}
          </div>}
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TooltipLabel message="How to use resistance">
            <FormattedMessage id="text.resistance" />
          </TooltipLabel>
          {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {data.resistances?.map((r, i) => <NumberRangeDisplay className="number" key={i} lo={r.lo} hi={r.hi} />)}
          </div>}
        </Space>
      </>}
    </Space>
  );
};

StockEvcInfoPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockEvcInfoPanel.defaultProps = {
};

export default withRouter(StockEvcInfoPanel);
