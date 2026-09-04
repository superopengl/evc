import React from 'react';
import PropTypes from 'prop-types';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

const StockChart = props => {
  const { symbol, period = '1d', interval = '5m' } = props;

  return <div style={{ height: 695, minWidth: 400 }}>
    <AdvancedRealTimeChart
      symbol={`${symbol}`}
      timezone="America/New_York"
      allow_symbol_change={false}
      save_image={false}
      autosize
      hide_legend={true}
    />
  </div>
}

StockChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  interval: PropTypes.string.isRequired,
};

export default StockChart;