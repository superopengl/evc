import React, { useRef } from 'react';
import { Area, Stock } from '@ant-design/charts';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getStockChartIntraday, getStockChart5D } from 'services/stockService';
import * as _ from 'lodash';
import * as moment from 'moment';

const StockChart = props => {
  const { symbol, type } = props;
  const [period, setPeriod] = React.useState(type);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const getFetchFunction = period => {
    switch (period) {
      case '1d':
        return getStockChartIntraday;
      case '5d':
        return getStockChart5D;
      default:
        throw new Error(`Unsupported period ${period}`);
    }
  }

  const formatTimeForRawData = (data) => {
   const formatted =  data.filter(x => x.average !== null).map((x, i) => ({
      ...x,
      tradeTime: moment(`${x.date} ${x.minute}`).toString()
    }));
    return formatted;
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchFunc = getFetchFunction(type);
      const rawData = await fetchFunc(symbol);
      setData(formatTimeForRawData(rawData));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [type]);

  const config = {
    // width: 400,
    // height: 500,
    legend: false,
    enterable: true,
    data: data,
    // tooltip: {
    //   customContent: (title, items) => {
    //     const item = items[0];
    //     if(!item) return null;
    //     return <div>
    //       {item.data.minute}
    //     </div>
    //   },
    // },
    xField: 'minute',
    yField: 'average',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#15be53 1:#15be53',
      fillOpacity: 0.7,
    },
    line: { color: '#15be53' },
    yAxis: {
      min: _.min(data.map(x => x.low)),
      max: _.max(data.map(x => x.high)),
    },
    xAxis: {
      tickInterval: 10
    }
  };

  return <>
  {/* <Stock
    {...config}
  /> */}

    <Area {...config}/>
  </>
}

StockChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['1d', '5d']).isRequired
};

StockChart.defaultProps = {
  type: '1d'
};

export default StockChart;