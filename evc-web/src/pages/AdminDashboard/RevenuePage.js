import React from 'react';
import { Space, Select, Button, Card, Typography, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import RevenueChart from 'components/charts/RevenueChart';
import { Loading } from 'components/Loading';
import { getRevenueChartData, downloadAllPaymentCsv } from 'services/revenueService';
import ReactDOM from 'react-dom';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { from } from 'rxjs';
import { saveAs } from 'file-saver';
import * as moment from 'moment';

const { Title } = Typography;

const RevenuePage = () => {

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({});
  const [period, setPeriod] = React.useState('month');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getRevenueChartData(period);
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
  }, [period]);

  const handleRefresh = () => {
    loadData();
  }

  const handleDownloadCsv = async () => {
    const data = await downloadAllPaymentCsv();
    const blob = new Blob([data], { type: 'text/csv,charset=utf-8' });
    saveAs(blob, `EVC-All-Payment-${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
  }

  return (
    <Loading loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Select defaultValue={period} onChange={setPeriod} style={{ width: 100 }}>
            <Select.Option value="day">Daily</Select.Option>
            {/* <Select.Option value="week">Weekly</Select.Option> */}
            <Select.Option value="month">Monthly</Select.Option>
            <Select.Option value="year">Yearly</Select.Option>
          </Select>
          <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadCsv}>Download CSV</Button>
          <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh}>Refresh</Button>
          </Space>
        </Space>
        <Card
          title="All regions"
        >
          <RevenueChart value={data.combined} />
        </Card>
        <Card
          title="New Zealand"
        >
          <RevenueChart value={data.NZ} />
        </Card>
        <Card
          title="None New Zealand"
        >
          <RevenueChart value={data.nonNZ} />
        </Card>
      </Space>
    </Loading>
  );
};

RevenuePage.propTypes = {};

RevenuePage.defaultProps = {};

export default withRouter(RevenuePage);
