import React from 'react';
import { Space, Select, Button, Card, Typography, Row, DatePicker } from 'antd';
import { withRouter } from 'react-router-dom';
import RevenueChart from 'components/charts/RevenueChart';
import { Loading } from 'components/Loading';
import { getRevenueChartData, downloadAllPaymentCsv } from 'services/revenueService';
import ReactDOM from 'react-dom';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import { saveAs } from 'file-saver';
import * as moment from 'moment';
import GuestSignUpChart from 'components/charts/GuestSignUpChart';
import { getUserGuestSignUpChart } from 'services/userService';

const { Title } = Typography;

const GuestSignUpPanel = () => {

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);
  const [interval, setInterval] = React.useState('day');
  const [period, setPeriod] = React.useState([null, moment()]);
  const [showTime, setShowTime] = React.useState(false);
  const [format, setFormat] = React.useState('YYYY-MM-DD');
  const [picker, setPicker] = React.useState('day');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = formatChartData(await getUserGuestSignUpChart({
        interval,
        start: period[0]?.toDate(),
        end: period[1]?.toDate()
      }));
      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, [interval, period]);

  React.useEffect(() => {
    if (interval === 'day') {
      setFormat('YYYY-MM-DD')
      setShowTime(false);
      setPicker('day');
    } else if (interval === 'month') {
      setFormat('YYYY-MM')
      setShowTime(false);
      setPicker('month');
    } else if (interval === 'hour') {
      setFormat('YYYY-MM-DD HH')
      setShowTime({
        format: 'HH'
      })
      setPicker('day');
    } else if (interval === 'minute') {
      setFormat('YYYY-MM-DD HH:mm')
      setShowTime({
        format: 'HH:mm'
      })
      setPicker('day');
    }
  }, [interval]);

  const handleRefresh = () => {
    loadData();
  }

  const formatChartData = (rawResponseData) => {
    const list = [];
    if (rawResponseData) {
      for (const item of rawResponseData.guests || []) {
        list.push({
          time: item.time,
          value: +item.count,
          type: 'Guest'
        });
      }
      for (const item of rawResponseData.signUps || []) {
        list.push({
          time: item.time,
          value: +item.count,
          type: 'New user'
        });
      }
    }
    return list;
  }

  const handlePeriodChange = ([start, end]) => {
    setPeriod([start, end]);
  }

  return (
    <Loading loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 20 }}>
          <Select defaultValue={interval} onChange={setInterval} style={{ width: 100 }}>
            <Select.Option value="minute">Minute</Select.Option>
            <Select.Option value="hour">Hour</Select.Option>
            <Select.Option value="day">Day</Select.Option>
            {/* <Select.Option value="week">Weekly</Select.Option> */}
            <Select.Option value="month">Month</Select.Option>
          </Select>
          <DatePicker.RangePicker showTime={showTime} format={format} picker={picker} value={period} onChange={handlePeriodChange} />
          {/* <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh}>Refresh</Button> */}
        </Space>
        <GuestSignUpChart value={data} />
      </Space>
    </Loading>
  );
};

GuestSignUpPanel.propTypes = {};

GuestSignUpPanel.defaultProps = {};

export default withRouter(GuestSignUpPanel);
