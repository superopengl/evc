import React, { useRef } from 'react';
import { Area, Stock, DualAxes } from '@ant-design/charts';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getStockChart } from 'services/stockService';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Button, Space, Select } from 'antd';
import ReactDOM from "react-dom";
import { Loading } from 'components/Loading';
import Chart from './Chart';
import { timeParse } from "d3-time-format";
const parseDate = timeParse("%Y-%m-%d");
const PERIOD_X_INTERVAL = {
  '1h': {
    '1m': {
      chartInterval: 1,
      chartLast: 60
    },
  },
  '4h': {
    '1m': {
      chartInterval: 1,
      chartLast: 240
    },
    '3m': {
      chartInterval: 3,
      chartLast: 80
    },
    '5m': {
      chartInterval: 5,
      chartLast: 48
    }
  },
  '1d': {
    '1m': {
      chartInterval: 1,
    },
    '5m': {
      chartInterval: 5,
    },
    '15m': {
      chartInterval: 15,
    },
  },
  '5d': {
    '10m': {
      chartInterval: 1,
    },
    '30m': {
      chartInterval: 3,
    },
    '1h': {
      chartInterval: 6,
    },
  },
  '1m': {
    '30m': {
      chartInterval: 1,
    },
    '1h': {
      chartInterval: 2,
    },
  },
  '1y': {
    '1d': {
      chartInterval: 1,
    },
  }
};

const StockChart = props => {
  const { symbol, period, interval } = props;
  const [chartState, setChartState] = React.useState({
    period: period,
    interval
  });
  const [data, setData] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const periods = Object.keys(PERIOD_X_INTERVAL);
  const intervals = _.uniq(Object.values(PERIOD_X_INTERVAL).reduce((pre, cur) => [...pre, ...Object.keys(cur)], []));

  const getTime = item => {
    const { date, minute } = item;
    return minute ? `${date} ${minute}` : date;
  }

  const formatTimeForRawData = (data, period) => {
    const minuteOnly = ['1h', '4h', '1d'].includes(period);
    if (_.isNil(data)) {
      return [];
    }
    const formatted = [];
    for (let i = 0, len = data.length; i < len; i++) {
      const rawItem = data[i];
      const rawPrice = rawItem.average ?? rawItem.marketAverage ?? rawItem.close;
      const datapoint = {
        price: rawPrice ?? (i === 0 ? rawItem.open : formatted[i - 1].price),
        time: minuteOnly ? rawItem.minute : getTime(rawItem),
        volume: rawItem.volume ?? rawItem.marketVolume ?? 0,
      }
      formatted.push(datapoint);
    }
    return formatted;
  }

  const loadChartData = async (symbol, period, interval) => {
    const rawData = await getStockChart(symbol, period, interval);

    setChartData(rawData.map(x => ({
      ...x,
      date: parseDate(x.date),
    })));

    const formatted = formatTimeForRawData(rawData, period);
    return formatted;
  }

  const tryCheckInterval = (period, interval) => {
    const validOptions = Object.keys(PERIOD_X_INTERVAL[period]);
    return validOptions.includes(interval) ? interval : validOptions[0];
  }

  const loadData = async (period, interval) => {
    try {
      setLoading(true);
      interval = tryCheckInterval(period, interval);
      const data = await loadChartData(symbol, period, interval);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setChartState({ period, interval });
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData(period, interval);
  }, []);

  const handlePeriodIntervalChange = async (p, v) => {
    if (p !== chartState.period || v !== chartState.interval) {
      loadData(p, v);
    }
  }

  const chartConfig = {
    data: [data, data],
    xField: 'time',
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        autoEllipsis: false,
      },
      tickCount: data.length > 30 ? data.length / 10 : data.length,
    },
    yField: ['price', 'volume'],
    // yAxis: {
    //   volume: {
    //     label: {
    //       formatter: function formatter(v) {
    //         return `${v/1000} k`;
    //       },
    //     },
    //   }
    // },
    geometryOptions: [
      {
        geometry: 'line',
        color: '#3273A4',
        lineStyle: {
          lineWidth: 1,
        }
      },
      {
        geometry: 'column',
        color: '#ffc069',
        // columnWidthRatio: 0.1,
        // color: (_ref, x, y, z) => {
        //   const value = _ref.price;
        //   return value > 100 ? '#f4664a' : '#30bf78';
        // }
      },
    ]
  }

  return <Loading loading={loading}>
    <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
      Period
      {periods.map(p => <Button type="link" key={p} onClick={() => handlePeriodIntervalChange(p, chartState.interval)} disabled={p === chartState.period}>{p}</Button>)}
    </Space>
    <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
      Interval
      {Object.keys(PERIOD_X_INTERVAL[chartState.period]).map(v => <Button type="link" key={v} onClick={() => handlePeriodIntervalChange(chartState.period, v)} disabled={v === chartState.interval}>{v}</Button>)}
    </Space>
    {/* <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
      Period
      <Select value={chartState.period} onChange={p => handlePeriodIntervalChange(p, chartState.interval)}>
        {periods.map(p => <Select.Option key={p} disabled={p === chartState.period}>{p.toUpperCase()}</Select.Option>)}
      </Select>
      Interval
      <Select value={chartState.interval} onChange={v => handlePeriodIntervalChange(chartState.period, v)}>
        {Object.keys(PERIOD_X_INTERVAL[chartState.period]).map(v => <Select.Option key={v} disabled={v === chartState.interval}>{v}</Select.Option>)}
      </Select>
    </Space> */}
    {/* <Area {...config}/> */}
    {/* <DualAxes {...chartConfig} /> */}
    {/* https://github.com/rrag/react-stockcharts-examples2 */}
   {chartData.length > 0 && <Chart type="hybrid" data={chartData} />}
  </Loading>
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