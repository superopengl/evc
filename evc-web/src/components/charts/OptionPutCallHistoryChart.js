
import React from "react";
import PropTypes from "prop-types";
import { Line, Mix } from '@ant-design/charts';
import { getStockPutCallRatioChart } from "services/stockService";
import ReactDOM from 'react-dom';
import { Loading } from "components/Loading";
import { from } from 'rxjs';
import { getOptionPutCallHistoryChartData, listOptionPutCallHistory } from "services/dataService";

const OptionPutCallHistoryChart = props => {
  const { symbol } = props;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  const formatData = React.useMemo(() => {
    const chartData = [];
    for (const d of data) {
      const { date, todayPercentPutVol, todayPercentCallVol, putCallOIRatio } = d;
      chartData.push({
        date,
        value: todayPercentPutVol,
        type: 'Today %Put Vol'
      }, {
        date,
        value: todayPercentCallVol,
        type: 'Today %Call Vol'
      }, {
        date,
        value: putCallOIRatio,
        type: 'Total P/C OI Ratio'
      });
    }
    return chartData;
  }, [data]);

  const load = async () => {
    try {
      const data = await getOptionPutCallHistoryChartData(symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
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
    data: formatData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: false,
    xAxis: { type: 'time' },
    yAxis: {
      type: 'log',
      // type: 'quantize',
      // base: 10,
      nice: true,
      min: 0,
      max: 100,
      // ticks: [0, 0.5, 1, 10, 20, 50, 100],
      // tickCount: 10,
      visible: true,
      label: {
        formatter: function formatter(v) {
          const num = +v;
          return num?.toFixed(0);
        },
      },
    },
    tooltip: {
      formatter: (item) => {
        const { value: rawValue, type } = item;
        let value = rawValue;
        switch (type) {
          case 'Today %Put Vol':
          case 'Today %Call Vol':
            value = `${rawValue} %`;
            break;
          default:
            break;
        }
        return { ...item, value };
      }
    },
    color: ["#ff5556", "#a4e057", '#531dab', '#ffc53d'],
  };

  const mixConfig = {
    appendPadding: 8,
    tooltip: {
      shared: true,
    },
    syncViewPadding: true,
    plots: [
      {
        type: 'line',
        options: {
          data: data,
          xField: 'date',
          yField: 'todayPercentPutVol',
          yAxis: {
            type: 'log',
            max: 100,
            visible: false,
            // tickCount: 10,
          },
          meta: {
            date: {
              sync: true,
            },
            todayPercentPutVol: {
              alias: 'Today %Put Vol',
              formatter: (v) => `${v} %`,
            },
          },
          // label: {
          //   position: 'middle',
          // },
        },
      },
      {
        type: 'line',
        options: {
          data: data,
          xField: 'date',
          yField: 'todayPercentCallVol',
          xAxis: false,
          yAxis: {
            type: 'log',
            max: 100,
            visible: false,
          },
          label: {
            // offsetY: -8,
          },
          meta: {
            todayPercentCallVol: {
              alias: 'Today %Call Vol',
              formatter: (v) => `${v} %`,
            },
          },
          color: '#FF6B3B',
          // annotations: averageData.map((d) => {
          //   return {
          //     type: 'dataMarker',
          //     position: d,
          //     point: {
          //       style: {
          //         stroke: '#FF6B3B',
          //         lineWidth: 1.5,
          //       },
          //     },
          //   };
          // }),
        },
      },
      {
        type: 'line',
        options: {
          data: data,
          xField: 'date',
          yField: 'putCallOIRatio',
          xAxis: false,
          yAxis: {
            line: null,
            grid: null,
            position: 'right',
            max: 3,
            visible: false,
            // tickCount: 10,
          },
          meta: {
            date: {
              sync: 'date',
            },
            putCallOIRatio: {
              alias: 'Total P/C OI Ratio',
              // formatter: (v) => `${(v * 100).toFixed(1)}%`,
            },
          },
          smooth: true,
          label: {
            callback: (value) => {
              return {
                offsetY: value === 0.148 ? 36 : value === 0.055 ? 0 : 20,
                style: {
                  fill: '#1AAF8B',
                  fontWeight: 700,
                  stroke: '#fff',
                  lineWidth: 1,
                },
              };
            },
          },
          color: '#1AAF8B',
        },
      },
    ],
  };

  return <Loading loading={loading}>
    {/* <Mix {...mixConfig} /> */}
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

export default OptionPutCallHistoryChart;
