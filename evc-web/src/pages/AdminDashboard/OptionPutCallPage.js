import React from 'react';
import { Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import OptionPutCallPanel from './OptionPutCallPanel';

const OptionPutCallPage = (props) => {

  return (
    <Card style={{ backgroundColor: 'white' }} bordered={true}>
      <Tabs defaultActiveKey="stock" type="card">
        <Tabs.TabPane tab="INDEX" key="index">
          <OptionPutCallPanel type="index" lastDayOnly={true} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="ETFs" key="etfs">
          <OptionPutCallPanel type="etfs" lastDayOnly={true} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Nasdaq 100 Stock+" key="nasdaq">
          <OptionPutCallPanel type="nasdaq" lastDayOnly={true} />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

OptionPutCallPage.propTypes = {};

OptionPutCallPage.defaultProps = {};

export default withRouter(OptionPutCallPage);
