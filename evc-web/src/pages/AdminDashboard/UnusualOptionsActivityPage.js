import React from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import UnusualOptionsActivityPanel from './UnusualOptionsActivityPanel';

const UnusualOptionsActivityPage = () => {

  return (
    <Card >
      <Tabs defaultActiveKey="stock" type="card">
        <Tabs.TabPane tab="Stock" key="stocks">
          <UnusualOptionsActivityPanel type="stock" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="ETFS" key="etfs">
          <UnusualOptionsActivityPanel type="etfs" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Index" key="index">
          <UnusualOptionsActivityPanel type="index" />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

UnusualOptionsActivityPage.propTypes = {};

UnusualOptionsActivityPage.defaultProps = {};

export default withRouter(UnusualOptionsActivityPage);
