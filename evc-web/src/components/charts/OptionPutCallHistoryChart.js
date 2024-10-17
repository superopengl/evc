
import React from "react";
import PropTypes from "prop-types";
import { Line } from '@ant-design/charts';
import ReactDOM from 'react-dom';
import { Loading } from "components/Loading";
import { from } from 'rxjs';
import { getOptionPutCallHistoryChartData } from "services/dataService";
import * as _ from 'lodash';
import moment from 'moment';

export const OptionPutCallHistoryChart = props => {
  const { symbol } = props;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  const convertToData = (resp) => {
    const chartData = [];
    for (const d of resp) {
      const { date: rawDate, todayPercentPutVol, todayPercentCallVol, putCallOIRatio } = d;
      const m = moment(rawDate);
      const date = m.format("YYYY/M/D");
      chartData.push({
        date: date,
        value: _.round(+todayPercentPutVol, 2) + 100,
        type: 'Today %Put Vol'
      })
      chartData.push({
        date,
        value: _.round(+todayPercentCallVol, 2) + 100,
        type: 'Today %Call Vol'
      });
      chartData.push({
        date,
        value: _.round(putCallOIRatio, 3) * 100,
        type: 'Total P/C OI Ratio'
      });
    }

    return chartData;
  };

  const load = async () => {
    try {
      const resp = await getOptionPutCallHistoryChartData(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(convertToData(resp));
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(load()).subscribe();

    return () => {
      load$.unsubscribe();
    }
  }, []);

  const config = {
    data: data,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: false,
    //// Don't enable xAxis, which will break tooltip on window resizing. 
    // xAxis: {
    //   type: 'time',
    //   nice: true,
    // },
    yAxis: {
      nice: true,
      position: 'right',
      // min: 0,
      // max: 200,
      tickCount: 10,
      visible: true,
      label: {
        formatter: (label) => {
          const value = +label;

          return value === 100 ? '0%\n1.0' : value < 100 ? (value / 100).toFixed(1) : (value - 100) + '%';
        },
      },
      grid: {
        line: {
          style: {
            lineWidth: 0.5,
            lineDash: [3, 2],
          }
        }
      }
    },
    annotations: [
      {
        type: 'line',
        /** 起始位置 */
        start: ['min', 100],
        /** 结束位置 */
        end: ['max', 100],
        style: {
          lineWidth: 1,
          stroke: '#AAAAAA',
        },
      },
    ],
    tooltip: {
      formatter: (item, x, y) => {
        const { value: rawValue, type } = item;
        let value = rawValue;
        switch (type) {
          case 'Today %Put Vol':
          case 'Today %Call Vol':
            value = `${(rawValue - 100).toFixed(2)} % `;
            break;
          default:
            value = (value / 100).toFixed(3);
            break;
        }
        return { name: item.type, value };
      }
    },
    color: ['#1570FF', '#ffc53d', '#F31dab'],
    lineStyle: {
      lineWidth: 2.0,
    },
  };

  return <Loading loading={loading}>
    <Line {...config} />
  </Loading>
}

OptionPutCallHistoryChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
};

OptionPutCallHistoryChart.defaultProps = {
  width: 500
};

