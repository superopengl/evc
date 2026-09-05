
import React from "react";
import PropTypes from "prop-types";
import { Line } from '@ant-design/charts';
import { Loading } from "components/Loading";
import { from } from 'rxjs';
import { getOptionPutCallHistoryChartData } from "services/dataService";
import * as _ from 'lodash';
import dayjs from 'util/dayjs';

export const OptionPutCallHistoryChart = props => {
  const { symbol, width = 500 } = props;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  const convertToData = (resp) => {
    const chartData = [];
    for (const d of resp) {
      const { date: rawDate, todayPercentPutVol, todayPercentCallVol, putCallOIRatio } = d;
      const m = dayjs(rawDate);
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
      setData(convertToData(resp));
      setLoading(false);
      
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
    // v4's `seriesField` both split and coloured the lines; in G2 v5 `encode.series` only splits,
    // and `colorField` is what does both (MaybeSeries infers the series from the color channel).
    colorField: 'type',
    //// Don't enable axis.x, which will break tooltip on window resizing.
    // axis: { x: { ... } },
    scale: {
      y: { nice: true },
      // v4's top-level `color: [...]` array is now the color scale's range.
      color: { range: ['#1570FF', '#ffc53d', '#F31dab'] },
    },
    axis: {
      y: {
        position: 'right',
        tickCount: 10,
        labelFormatter: (label) => {
          const value = +label;

          return value === 100 ? '0%\n1.0' : value < 100 ? (value / 100).toFixed(1) : (value - 100) + '%';
        },
        grid: true,
        gridLineWidth: 0.5,
        gridLineDash: [3, 2],
      },
    },
    // @ant-design/charts 2 turns every `annotations` entry into a child mark verbatim, with none
    // of the parent's fields extended onto it. v4's `{type: 'line', start: ['min', 100], end:
    // ['max', 100]}` therefore became a plain `line` mark with no x/y encode, and G2's line mark
    // throws `Missing encode for x or y channel` for that. `lineY` is the reference-line mark:
    // `data: [100]` is read as its y encode, against the shared y scale.
    annotations: [
      {
        type: 'lineY',
        data: [100],
        style: {
          lineWidth: 1,
          stroke: '#AAAAAA',
        },
      },
    ],
    tooltip: {
      items: [
        (d) => {
          const { value: rawValue, type } = d;
          switch (type) {
            case 'Today %Put Vol':
            case 'Today %Call Vol':
              return { name: type, value: `${(rawValue - 100).toFixed(2)} % ` };
            default:
              return { name: type, value: (rawValue / 100).toFixed(3) };
          }
        },
      ],
    },
    style: {
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

