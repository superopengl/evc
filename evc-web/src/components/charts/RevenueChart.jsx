
import React from "react";
import PropTypes from "prop-types";
import { Line } from '@ant-design/charts';

const RevenueChart = props => {

  const { value } = props;
  const [data, setData] = React.useState([]);

  React.useEffect(()=> {
    const list = [];
    for(const item of (value || [])) {
      list.push(
        {
          time: item.time,
          value: +item.revenue,
          type: 'revenue'
        },
        {
          time: item.time,
          value: +item.profit,
          type: 'profit'
        },      {
          time: item.time,
          value: +item.credit,
          type: 'credit'
        }
      )
    };
    setData(list);
  }, [value]);

  const config = {
    data: data,
    xField: 'time',
    yField: 'value',
    // `seriesField` only splits in G2 v5; `colorField` splits *and* colours, as v4's did.
    colorField: 'type',
    // isPercent/isStack are now percent/stack (they map to the normalizeY/stackY transforms).
    percent: true,
    stack: true,
    label: {
      // v4's 'middle' is not a G2 v5 position, and `content` is now `text`.
      position: 'inside',
      text: (item) => item.value.toFixed(2),
      style: { fill: '#000' },
    },
    // v4's top-level `color: [...]` array is now the color scale's range.
    scale: {
      color: { range: ['#55B0D4', '#d7183f', '#fa8c16'] },
    },
    // axis: { x: { ... } },
    axis: {
      y: {
        labelFormatter: (v) => `$ ${(+v).toLocaleString()}`,
      },
    },
  };

  return <Line {...config} />
  // return <Column {...config} />
}

RevenueChart.propTypes = {
  value: PropTypes.array.isRequired,
};

export default RevenueChart;
