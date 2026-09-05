
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
    // `seriesField` only splits in G2 v5; `colorField` splits *and* colours, as v4's did.
    colorField: 'type',
    // isGroup/isStack/isPercent are now group/stack/percent (they map to G2 transforms).
    group: true,
    // percent: true,
    // stack: true,
    label: {
      // v4's 'middle' is not a G2 v5 position, and `layout` is now `transform`.
      position: 'inside',
      transform: [
        { type: 'exceedAdjust' },
        { type: 'overlapHide' },
        { type: 'contrastReverse' },
      ],
      // text: (item) => item.value,
    },
    // v4's top-level `color: [...]` array is now the color scale's range.
    scale: {
      color: { range: ['#fa8c16', '#55B0D4'] },
    },
  };

  // return <Line {...config} />
  return <Column {...config} />
}

GuestSignUpChart.propTypes = {
  value: PropTypes.array.isRequired,
};

export default GuestSignUpChart;
