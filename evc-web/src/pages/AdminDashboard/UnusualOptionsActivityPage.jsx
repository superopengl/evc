import React from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'util/withRouter';
import UnusualOptionsActivityPanel from './UnusualOptionsActivityPanel';

const UnusualOptionsActivityPage = (props) => {
  const { size } = props;

  return (
    <Card style={{ backgroundColor: 'white' }}>
      {/* antd 6 keeps `Tabs.TabPane` only as a deprecation shim (`() => null` plus a legacy
          children->items conversion) and drops it in v7. `items` is the supported API.
          `defaultActiveKey` was "stock", which matches no tab - Tabs then silently fell back
          to the first one, so it happened to look right. */}
      <Tabs
        defaultActiveKey="stocks"
        type="card"
        items={[
          { key: 'stocks', label: 'Stocks', children: <UnusualOptionsActivityPanel type="stock" size={size} /> },
          { key: 'etfs', label: 'ETFs', children: <UnusualOptionsActivityPanel type="etfs" size={size} /> },
          { key: 'index', label: 'INDICES', children: <UnusualOptionsActivityPanel type="index" size={size} /> },
        ]}
      />
    </Card>
  );
};

UnusualOptionsActivityPage.propTypes = {};

export default withRouter(UnusualOptionsActivityPage);
