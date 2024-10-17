import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockEvcInfo } from 'services/stockService';
import ReactDOM from "react-dom";
import { Skeleton } from 'antd';
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { SectionTitleDivider } from './SectionTitleDivider';
import { NumberValueDisplay } from './NumberValueDisplay';

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
      {/* <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel>
          <FormattedMessage id="text.reportDate" />
        </TooltipLabel>
        {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <Text>{moment(data.fairValueDate).format('D MMM YYYY')}</Text>}
      </Space> */}
      <SectionTitleDivider title={loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <Text><FormattedMessage id="text.reportDate" />: {moment(data.fairValueDate).format('D MMM YYYY')}</Text>} />
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <TooltipLabel message="How to use fair value">
          <FormattedMessage id="text.fairValue" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={[data.fairValueLo, data.fairValueHi]}
          minus={<Text type="danger"><FormattedMessage id="text.loss" /></Text>} />
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.forwardNextFyFairValue" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={[data.forwardNextFyFairValueLo, data.forwardNextFyFairValueHi]}
          minus={<Text type="danger"><FormattedMessage id="text.forwardNextFyFairValueLoss" /></Text>}
        />
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.forwardNextFyMaxValue" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={[data.forwardNextFyMaxValueLo, data.forwardNextFyMaxValueHi]}
          minus={<Text type="danger"><FormattedMessage id="text.forwardNextFyFairValueLoss" /></Text>}
        />
      </Space>
      <SectionTitleDivider title={<FormattedMessage id="text.dailyUpdate" />} ></SectionTitleDivider>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.beta" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={data.beta}
          fixedDecimal={3}
        />
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.peRatio" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={data.peRatio}
          minus={<Text type="danger"><FormattedMessage id="text.epsTtmLoss" /></Text>}
        />
      </Space>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <TooltipLabel message="">
          <FormattedMessage id="text.forwardRatio" />
        </TooltipLabel>
        <NumberValueDisplay className="number"
          loading={loading}
          value={data.forwardPeRatio}
          minus={<Text type="danger"><FormattedMessage id="text.forwardEpsLoss" /></Text>}
        />
      </Space>
      {SHOW_SUPPORT_RESISTANCE && <>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TooltipLabel message="How to use support">
            <FormattedMessage id="text.support" />
          </TooltipLabel>
          {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {data.supports?.map((s, i) => <NumberValueDisplay className="number" key={i} value={[s.lo, s.hi]} />)}
          </div>}
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TooltipLabel message="How to use resistance">
            <FormattedMessage id="text.resistance" />
          </TooltipLabel>
          {loading ? <Skeleton.Input size="small" style={{ width: 150 }} active /> : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {data.resistances?.map((r, i) => <NumberValueDisplay className="number" key={i} value={[r.lo, r.hi]} />)}
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
