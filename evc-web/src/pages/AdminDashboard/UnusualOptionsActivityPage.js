import React from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import UnusualOptionsActivityPanel from './UnusualOptionsActivityPanel';

const UnusualOptionsActivityPage = (props) => {
  const {size} = props;

  return (
    <Card style={{backgroundColor: 'white'}} bordered={true}>
      <Tabs defaultActiveKey="stock" type="card">
        <Tabs.TabPane tab="Stock" key="stocks">
          <UnusualOptionsActivityPanel type="stock" size={size}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="ETFS" key="etfs">
          <UnusualOptionsActivityPanel type="etfs" size={size}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Index" key="index">
          <UnusualOptionsActivityPanel type="index" size={size}/>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

UnusualOptionsActivityPage.propTypes = {};

UnusualOptionsActivityPage.defaultProps = {};

export default withRouter(UnusualOptionsActivityPage);
