import React, { useRef } from 'react';
import { Area, Stock, DualAxes } from '@ant-design/charts';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getStockChart } from 'services/stockService';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Button, Space } from 'antd';
import ReactDOM from "react-dom";
import { Loading } from 'components/Loading';

const StockChart = props => {
  const { symbol, type: propPeriod } = props;
  const [period, setPeriod] = React.useState(propPeriod);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const periods = [
    '1h',
    '4h',
    '1d',
    '5d',
    '1m',
    '1y'
  ]

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
      const rawPrice = rawItem.average ?? rawItem.marketAverage;
      const datapoint = {
        price: rawPrice ?? (i === 0 ? rawItem.open : formatted[i - 1].price),
        time: minuteOnly ? rawItem.minute : getTime(rawItem),
        volume: rawItem.volume ?? rawItem.marketVolume ?? 0,
      }
      formatted.push(datapoint);
    }
    return formatted;
  }

  const loadChartData = async (symbol, period) => {
    const rawData = await getStockChart(symbol, period);
    const formatted = formatTimeForRawData(rawData, period);
    return formatted;
  }

  const loadData = async (period) => {
    try {
      setLoading(true);
      const data = await loadChartData(symbol, period);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setPeriod(period);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData(propPeriod);
  }, []);

  const handleChangePeriod = async p => {
    if (p !== period) {
      loadData(p);
    }
  }

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
    height: 200,
    xField: 'time',
    yField: 'price',
    // areaStyle: {
    //   fill: 'l(270) 0:#ffffff 0.5:#15be53 1:#15be53',
    //   fillOpacity: 0.7,
    // },
    // line: { color: '#15be53' },
    yAxis: {
      min: _.min(data.map(x => x.price)),
      max: _.max(data.map(x => x.price)),
    },
    // xAxis: {
    //   tickInterval: 30
    // }
  };

  const configDual = {
    data: [data, data],
    xField: 'time',
    yField: ['price', 'volume'],
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
        color: '#fa8c16',
        // color: (_ref, x, y, z) => {
        //   const value = _ref.price;
        //   return value > 1800 ? '#f4664a' : '#30bf78';
        // }
      },
    ]
  }

  return <Loading loading={loading}>
    <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
      {periods.map(p => <Button type="link" key={p} onClick={() => handleChangePeriod(p)} disabled={p === period}>{p}</Button>)}

    </Space>
    {/* <Area {...config}/> */}
    <DualAxes {...configDual} />
  </Loading>
}

StockChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

StockChart.defaultProps = {
  type: '1d'
};

export default StockChart;