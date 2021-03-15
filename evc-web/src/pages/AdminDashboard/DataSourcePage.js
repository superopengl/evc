import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { MemberOnlyCard } from 'components/MemberOnlyCard';
import { refreshMaterializedViews } from 'services/dataService';
import { LongRunningActionButton } from 'components/LongRunningActionButton';

const { Text } = Typography;

const DataSourcePage = () => {

  const loadList = async () => {
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleUploadSupportCsv = async () => {

  }

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
              uploadAction="/admin/data/upload/support"
            />
            <LongRunningActionButton
              operationKey="upload-resistance-csv"
              buttonText="Resistance"
              type="upload"
              uploadAction="/admin/data/upload/resistance"
            />
          </Space>
        }>
        Bulk upload from CSV file. The CSV file must have a header row with three columns <Text code>symbol</Text>, <Text code>lo</Text>, <Text code>hi</Text>. Duplicate rows (same symbol, lo and hi values) will be inserted into database only once. A sample is as below.
          <Text><pre><small>
          {`symbol,lo,hi
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
              operationKey="upload-uoa-stocks"
              buttonText="Stocks"
              type="upload"
              uploadAction="/admin/data/upload/uoa/stocks"
            />
            <LongRunningActionButton
              operationKey="upload-resistance-etfs"
              buttonText="ETFS"
              type="upload"
              uploadAction="/admin/data/upload/uoa/etfs"
              onOk={handleUploadSupportCsv}
            />
            <LongRunningActionButton
              operationKey="upload-resistance-indices"
              buttonText="Indices"
              type="upload"
              uploadAction="/admin/data/upload/uoa/indices"
              onOk={handleUploadSupportCsv}
            />
          </Space>
        }
      >
        Bulk upload from CSV file. The CSV file must have a header row as below.
          <Text><pre><small>
          {`symbol,price,type,strike,expDate,dte,bid,midpoint,ask,last,volume,openInt,voloi,iv,time
GM,56.83,Call,65,04/01/21,21,0.74,0.76,0.77,0.74,20184,230,87.76,57.69%,03/10/21
SBH,20.9,Put,17.5,04/16/21,36,0.4,0.43,0.45,0.44,5054,105,48.13,66.65%,03/10/21
ETSY,205.93,Call,205,03/19/21,8,9.15,9.48,9.8,9.74,5037,111,45.38,76.40%,03/10/21
BA,245.34,Put,240,03/12/21,2,1.75,1.8,1.85,1.75,13246,292,45.36,53.66%,03/10/21`}
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
    </Space>
  );
};

DataSourcePage.propTypes = {};

DataSourcePage.defaultProps = {};

export default withRouter(DataSourcePage);
