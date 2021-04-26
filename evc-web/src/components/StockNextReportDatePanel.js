import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Space } from 'antd';
import { withRouter } from 'react-router-dom';
import { TimeAgo } from 'components/TimeAgo';
import ReactDOM from "react-dom";
import { Skeleton } from 'antd';
import { from } from 'rxjs';
import { getStockNextReportDate } from 'services/stockService';
import moment from 'moment';

const { Text, Paragraph } = Typography;


const StockNextReportDatePanel = (props) => {

  const { symbol } = props;
  const [reportDate, setReportDate] = React.useState();
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    if (!symbol) {
      return;
    }
    try {
      setLoading(true);

      const reportDate = await getStockNextReportDate(symbol);

      ReactDOM.unstable_batchedUpdates(() => {
        setReportDate(reportDate);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadEntity()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, [symbol]);


  if (loading) {
    return <Skeleton active />
  }

  return (
    <Space>
      <Text strong style={{fontSize: 20}}>{moment(reportDate).format('D MMM YYYY')}</Text>
      <TimeAgo value={reportDate} showTime={false} accurate={false} direction="horizontal" />
    </Space>
  );
};

StockNextReportDatePanel.propTypes = {
  symbol: PropTypes.string.isRequired
};

StockNextReportDatePanel.defaultProps = {
};

export default withRouter(StockNextReportDatePanel);
