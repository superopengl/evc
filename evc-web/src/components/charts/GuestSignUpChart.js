
import React from "react";
import PropTypes from "prop-types";
import {Column, Line } from '@ant-design/charts';

const GuestSignUpChart = props => {

  const { value } = props;
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    setData(value || []);
  }, [value]);

  const config = {
    data,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    // isPercent: true,
    // isStack: true,
    label: {
      position: 'middle',
      layout: [
        { type: 'interval-adjust-position' },
        { type: 'interval-hide-overlap' },
        { type: 'adjust-color' },
      ],
      // content: function content(item) {
      //   return item.value;
      // },
      // style: { fill: '#000' },
    },
    color: ['#fa8c16', '#55B0D4'],
    // xAxis: { type: 'time' },
    // yAxis: {
    //   label: {
    //     formatter: (v) => {
    //       return `$ ${(+v).toLocaleString()}`;
    //     },
    //   },
    // },
  };

  // return <Line {...config} />
  return <Column {...config} />
}

GuestSignUpChart.propTypes = {
  value: PropTypes.array.isRequired,
};

GuestSignUpChart.defaultProps = {
};

export default GuestSignUpChart;
