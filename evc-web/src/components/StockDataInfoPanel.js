import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space, Card, Table } from 'antd';
import { withRouter } from 'react-router-dom';
import { getStockDataInfo } from 'services/stockService';
import { TimeAgo } from 'components/TimeAgo';
import * as moment from 'moment-timezone';
import ReactDOM from "react-dom";
import * as _ from 'lodash';

const { Paragraph, Text, Title } = Typography;


const StockDataInfoPanel = (props) => {

  const { symbol } = props;
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const info = await getStockDataInfo(symbol);
      const list = formatList(info);
      ReactDOM.unstable_batchedUpdates(() => {
        setList(list);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  const formatList = (info) => {
    return Object.entries(info).map(([key, value]) => ({
      key,
      value
    })).filter(x => x.key !== 'symbol')
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const columnDef = [
    {
      dataIndex: 'key',
      render: (value, item) => <Text type="secondary"><small>{value}</small></Text>
    },
    {
      dataIndex: 'value',
      align: 'right',
      render: (value, item) => {
        const time = moment(value);
        if(_.isFinite(+value)) {
          // Number
          return +value?.toLocaleString();
        } else if(time.isValid()) {
          // Date
          return time.format('D MMM YYYY');
        } 
        return value;
      }
    }
  ];

  return (
    <Table
      columns={columnDef}
      dataSource={list}
      showHeader={false}
      rowKey="key"
      size="small"
      loading={loading}
      pagination={false}
      style={{ width: '100%' }}
    />


  );
};

StockDataInfoPanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockDataInfoPanel.defaultProps = {
};

export default withRouter(StockDataInfoPanel);
