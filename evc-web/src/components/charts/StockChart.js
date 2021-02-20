import React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import TradingViewWidget from 'react-tradingview-widget';

const StockChart = props => {
  const { symbol } = props;

  return <div style={{height: 500}}>
    <TradingViewWidget 
    symbol={`${symbol}`} 
    timezone="America/New_York"
    allow_symbol_change={false}
    save_image={false}
    autosize
    />
    </div>
}

StockChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  interval: PropTypes.string.isRequired,
};

StockChart.defaultProps = {
  period: '1d',
  interval: '5m'
};

export default StockChart;