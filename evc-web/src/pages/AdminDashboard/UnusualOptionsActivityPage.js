import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Tabs, Card } from 'antd';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import UnusualOptionsActivityPanel from './UnusualOptionsActivityPanel';
import { FormattedMessage } from 'react-intl';

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
