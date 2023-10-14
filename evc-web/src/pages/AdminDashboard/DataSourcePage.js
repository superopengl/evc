import React from 'react';
import { Typography, Space, Card, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import { refreshMaterializedViews, flushCache } from 'services/dataService';
import { LongRunningActionButton } from 'components/LongRunningActionButton';
import { notify } from 'util/notify';

const { Text, Paragraph } = Typography;

const DataSourcePage = () => {

  const loadList = async () => {
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handlePutCallRatioUploadComplete = () => {
    notify.info('Successfully uploaded put call ratio csv file', <>
    You need to execute <Button type="primary" size="small">Refresh Materialized Views</Button> before all users can see the data.
    </>);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>

      <Card
        bordered={false}
        title="Support / Resistance"
        extra={
          <Space>
            <LongRunningActionButton
              operationKey="upload-support-resistance-csv"
              buttonText="Support / Resistance"
              type="upload"
              uploadAction="/admin/data/sr"
            />
          </Space>
        }>
          <Paragraph>
            Bulk update support/resistance values with CSV file, which will replace the existing support/resistance values. The CSV file must have a header row with three columns <Text code>Symbol</Text>, <Text code>Support</Text>, <Text code>Resistance</Text>. Duplicate rows (same symbol, lo and hi values) will be inserted into database only once.
          </Paragraph>
          <Paragraph>
            Missing <Text code>Symbol</Text> column value will carry over the the cloest symbol value from top. The <Text code>Symbol</Text> value in the first data line is required). See below sample. 
          </Paragraph>
         
          <Text><pre><small>
          {`Symbol,Support,Resistance
AAPL,120,150-160
,,180-190
GOOG,1000-1100,2000
,2100-2200,2200-2300`}
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
        <Paragraph>
        Bulk upload from CSV file. The CSV file must have a header row as below.
        </Paragraph>
        <Paragraph>
          The csv uploads for Unusual Options Activity do not handle duplicate records. Duplicated upload will cause the same data appear multiple time.
        </Paragraph>
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
              onComplete={handlePutCallRatioUploadComplete}
            />
          </Space>
        }>
        Bulk upload Put Call Ratio data from CSV file. The CSV file must have a header row as below (double quote <Text code>"</Text> is required). <Text code>Symbol</Text> and <Text code>Date</Text> are used as the primary key. Duplicate records will be ignored during the upload.
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
        A heavy operation (may take several minutes to complete) that updates all client facing information based on the latest data provided. This should only be executed by data admins when data inconsistency is detected.
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
