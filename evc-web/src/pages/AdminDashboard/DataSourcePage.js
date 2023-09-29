import React from 'react';
import { Typography, Space, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { refreshMaterializedViews, flushCache } from 'services/dataService';
import { LongRunningActionButton } from 'components/LongRunningActionButton';

const { Text } = Typography;

const DataSourcePage = () => {

  const loadList = async () => {
  }

  React.useEffect(() => {
    loadList();
  }, []);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      <Card
        bordered={false}
        title="Support / Resistance"
        extra={
          <Space>
            <LongRunningActionButton
              operationKey="upload-support-csv"
              buttonText="Support"
              type="upload"
              uploadAction="/admin/data/support"
            />
            <LongRunningActionButton
              operationKey="upload-resistance-csv"
              buttonText="Resistance"
              type="upload"
              uploadAction="/admin/data/resistance"
            />
          </Space>
        }>
        Bulk upload from CSV file. The CSV file must have a header row with three columns <Text code>symbol</Text>, <Text code>lo</Text>, <Text code>hi</Text>. Duplicate rows (same symbol, lo and hi values) will be inserted into database only once. A sample is as below.
          <Text><pre><small>
          {`Symbol,lo,hi
AAPL,120,150
AAPL,160,180
GOOG,1000,2000
GOOG,2100,2200`}
        </small> </pre></Text>
      </Card>

      <Card
        bordered={false}
        title="Unusual Options Activity"
        extra={
          <Space>
            <LongRunningActionButton
              operationKey="upload-uoa-stock"
              buttonText="Stock"
              type="upload"
              uploadAction="/admin/data/uoa/stock"
            />
            <LongRunningActionButton
              operationKey="upload-resistance-etfs"
              buttonText="ETFS"
              type="upload"
              uploadAction="/admin/data/uoa/etfs"
            />
            <LongRunningActionButton
              operationKey="upload-resistance-index"
              buttonText="Index"
              type="upload"
              uploadAction="/admin/data/uoa/index"
            />
          </Space>
        }
      >
        Bulk upload from CSV file. The CSV file must have a header row as below.
          <Text><pre><small>
          {`Symbol,Price,Type,Strike,"Exp Date",DTE,Bid,Midpoint,Ask,Last,Volume,"Open Int",Vol/OI,IV,Time
CCJ,16.5,Call,35,09/17/21,172,0.36,0.37,0.38,0.38,15103,256,59,74.80%,03/29/21
GSX,31.78,Call,40,04/16/21,18,1.8,1.99,2.18,1.85,6521,133,49.03,155.62%,03/29/21
KTOS,27.43,Call,30,04/16/21,18,1.1,1.18,1.25,1.15,25473,575,44.3,86.68%,03/29/21
DISCA,41.23,Call,75,05/21/21,53,0.25,0.48,0.7,0.5,12660,307,41.24,99.10%,03/29/21`}
        </small> </pre></Text>
      </Card>

      <Card
        bordered={false}
        title="Put Call Ratio"
        extra={
          <Space>
            <LongRunningActionButton
              operationKey="upload-putCallRatio-csv"
              buttonText="Put Call Ratio"
              type="upload"
              uploadAction="/admin/data/put_call_ratio"
            />
          </Space>
        }>
        Bulk upload from CSV file. The CSV file must have a header row as below.
          <Text><pre><small>
          {`Symbol,Date,"Put Call Ratio"
AAPL,09/17/21,0.3
AAPL,09/18/21,0.5
GOOG,09/17/21,0.75
GOOG,09/18/21,0.85`}
        </small> </pre></Text>
      </Card>

      <Card
        bordered={false}
        title="Refresh Materialized Views"
        extra={<LongRunningActionButton
          operationKey="refresh-mv"
          buttonText="Refresh Materialized Views"
          type="button"
          onOk={refreshMaterializedViews}
        />}>
        Refresh Materialized Views. This operation should only be executed by data admins.
      </Card>


      <Card
        bordered={false}
        title="Flush Cache"
        extra={<LongRunningActionButton
          operationKey="flush-cache"
          buttonText="Flush Cache"
          type="button"
          onOk={flushCache}
        />}>
        Flush all from the Redis cache.
      </Card>
    </Space>
  );
};

DataSourcePage.propTypes = {};

DataSourcePage.defaultProps = {};

export default withRouter(DataSourcePage);
