
import React from "react";
import PropTypes from "prop-types";
import { Line } from '@ant-design/charts';
import ReactDOM from 'react-dom';
import { Loading } from "components/Loading";
import { from } from 'rxjs';
import { getOptionPutCallHistoryChartData } from "services/dataService";
import * as _ from 'lodash';

export const OptionPutCallHistoryChart = props => {
  const { symbol } = props;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  const formatData = React.useMemo(() => {
    const chartData = [];
    for (const d of data) {
      const { date, todayPercentPutVol, todayPercentCallVol, putCallOIRatio } = d;
      chartData.push({
        date,
        value: todayPercentPutVol + 100,
        type: 'Today %Put Vol'
      }, {
        date,
        value: todayPercentCallVol + 100,
        type: 'Today %Call Vol'
      }, {
        date,
        value: putCallOIRatio * 100,
        type: 'Total P/C OI Ratio'
      });
    }
    return chartData;
  }, [data]);

  const load = async () => {
    try {
      const data = await getOptionPutCallHistoryChartData(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data.map(d => ({
          ...d,
          putCallOIRatio: _.round(+d.putCallOIRatio, 3),
          todayPercentPutVol: _.round(+d.todayPercentPutVol, 2),
          todayPercentCallVol: _.round(+d.todayPercentCallVol, 2),
        })));
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

  const config = React.useMemo(() => {
    return {
      data: formatData,
      xField: 'date',
      yField: 'value',
      seriesField: 'type',
      smooth: false,
      xAxis: {
        type: 'time',
        nice: true,
      },
      yAxis: {
        // type: 'log',
        // type: 'quantize',
        // base: 10,
        nice: true,
        position: 'right',
        min: 0,
        max: 200,
        // ticks: [0, 10, 20, 40, 60, 80, 100],
        tickCount: 10,
        visible: true,
        label: {
          formatter: (label) => {
            const value = +label;

            return value === 100 ? '0%\n1.0' : value < 100 ? (value / 100).toFixed(1) : (value - 100) + '%';
          },
          // rotate: true
        },
        grid: {
          line: {
            style: {
              lineWidth: 0.5,
              lineDash: [3, 2],
              // strokeOpacity: 0.7,
              // shadowColor: 'black',
              // shadowBlur: 10,
              // shadowOffsetX: 5,
              // shadowOffsetY: 5,
            }
          }
        }
      },
      // annotations: {
      //   pv: [
      //     {
      //       type: 'text',
      //       position: ['median', 'max'],
      //       content: '左轴',
      //     },
      //   ],
      //   uv: [
      //     {
      //       type: 'text',
      //       position: ['min', 'max'],
      //       content: '右轴',
      //     },
      //   ],
      // },
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
            // strokeOpacity: 1,
            // fillOpacity: 1,
            // opacity: 1,
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
              value = `${(rawValue - 100).toFixed(2)} %`;
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
  }, [formatData]);


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

