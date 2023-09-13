import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Tabs, Tag, Badge } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';
import { CaretRightOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
width: 100%;

.ant-alert {
  margin-bottom: 10px;
}

`;


const UnusualOptionsActivityPanel = () => {

  const [data, setData] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();

      ReactDOM.unstable_batchedUpdates(() => {
        setData(data);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  return (
    <ContainerStyled>
      <Loading loading={loading} >
        <Tabs defaultActiveKey="stocks" type="card">
          <Tabs.TabPane tab="Stocks" key="stocks">

          </Tabs.TabPane>
          <Tabs.TabPane tab="ETFS" key="etfs">

          </Tabs.TabPane>
          <Tabs.TabPane tab="Indices" key="indices">

          </Tabs.TabPane>
        </Tabs>
      </Loading>
    </ContainerStyled>
  );
};

UnusualOptionsActivityPanel.propTypes = {};

UnusualOptionsActivityPanel.defaultProps = {};

export default withRouter(UnusualOptionsActivityPanel);
