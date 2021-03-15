import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import UnusualOptionsActivityPanel from './UnusualOptionsActivityPanel';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-alert {
  margin-bottom: 10px;
}

`;





const UnusualOptionsActivityPage = () => {

  // const loadList = async () => {
  //   try {
  //     setLoading(true);
  //     const data = [];

  //     ReactDOM.unstable_batchedUpdates(() => {
  //       setData(data);
  //       setLoading(false);
  //     });
  //   } catch {
  //     setLoading(false);
  //   }
  // }

  // React.useEffect(() => {
  //   loadList();
  // }, []);

  return (
    <Card title="Unusual Options Activity">
      <Tabs defaultActiveKey="stocks" type="card">
        <Tabs.TabPane tab="Stocks" key="stocks">
          <UnusualOptionsActivityPanel type="stocks" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="ETFS" key="etfs">
          <UnusualOptionsActivityPanel type="etfs" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Indices" key="indices">
          <UnusualOptionsActivityPanel type="indices" />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

UnusualOptionsActivityPage.propTypes = {};

UnusualOptionsActivityPage.defaultProps = {};

export default withRouter(UnusualOptionsActivityPage);
