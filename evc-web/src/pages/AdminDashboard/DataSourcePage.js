import React from 'react';
import { Typography, Space, Card, Button, List, Table } from 'antd';
import { withRouter } from 'react-router-dom';
import { refreshMaterializedViews, flushCache, getCacheKeys, deleteCacheKey, getCacheKeyedValue } from 'services/dataService';
import { LongRunningActionButton } from 'components/LongRunningActionButton';
import { notify } from 'util/notify';
import { CloseOutlined, SyncOutlined } from '@ant-design/icons';
import { TimeAgo } from 'components/TimeAgo';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const DataSourcePage = () => {

  const [cachedItems, setCachedItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    const keys = await getCacheKeys();
    const value = keys.map(k => ({ key: k }));
    setCachedItems(value);
    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, [])

  const handleGetValue = async (item) => {
    setLoading(true);
    try {
      const value = await getCacheKeyedValue(item.key);
      item.value = value;
      setCachedItems([...cachedItems]);
    } finally {
      setLoading(false);
    }
  }


  const handleDeleteKey = async (key) => {
    setLoading(true);
    try {
      await deleteCacheKey(key);
      await load();
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      title: 'Key name',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Created',
      dataIndex: 'value',
      key: 'created',
      render: item => item?.value && <>{item.value} <TimeAgo value={item.value} direction="horizontal" showTime={false} /></>,
    },
    {
      title: 'TTL',
      dataIndex: 'value',
      key: 'ttl',
      render: item => item?.ttl > 0 && <>{item.ttl} seconds (<TimeAgo value={moment().add(item.ttl, 'seconds')} direction="horizontal" showTime={false} />)</>
    },
    {
      fixed: 'right',
      width: 80,
      key: 'buttons',
      render: item => {
        return <Space>
          <Button disabled={loading} shape='circle' onClick={() => handleGetValue(item)} icon={<SyncOutlined />}></Button>
          <Button shape='circle' danger disabled={loading} onClick={() => handleDeleteKey(item.key)} icon={<CloseOutlined />}></Button>
        </Space>
      }
    },
  ]

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
              onComplete={() => {
                notify.success('Successfully upload support/resistance');
              }}
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
              buttonText="Stocks"
              type="upload"
              uploadAction="/admin/data/uoa/stock"
              onComplete={() => {
                notify.success('Successfully upload unusual options activity stocks')
              }}
            />
            <LongRunningActionButton
              operationKey="upload-resistance-etfs"
              buttonText="ETFs"
              type="upload"
              uploadAction="/admin/data/uoa/etfs"
              onComplete={() => {
                notify.success('Successfully upload unusual options activity ETFs')
              }}
            />
            <LongRunningActionButton
              operationKey="upload-resistance-index"
              buttonText="INDICES"
              type="upload"
              uploadAction="/admin/data/uoa/index"
              onComplete={() => {
                notify.success('Successfully upload unusual options activity INDICES')
              }}
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
          danger
          operationKey="flush-cache"
          buttonText="Flush Cache All"
          type="button"
          onOk={flushCache}
        />}>
        <Paragraph>Manage cached locks. Be albe to flush all of them from the Redis cache.</Paragraph>
        {cachedItems?.length > 0 && <Table
          loading={loading}
          size="small"
          columns={columns}
          dataSource={cachedItems}
          pagination={false}
        />}
      </Card>
    </Space>
  );
};

DataSourcePage.propTypes = {};

DataSourcePage.defaultProps = {};

export default withRouter(DataSourcePage);
