import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Row, Col, Alert } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { Link, withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { getDashboard } from 'services/dashboardService';

const { Text } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem 4rem 1rem;
width: 100%;
// max-width: 600px;

.ant-alert {
  margin-bottom: 10px;
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;

const AdminDashboardPage = () => {

  const [data, setData] = React.useState([]);
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
    <LayoutStyled>
      <HomeHeader>
      </HomeHeader>
      <ContainerStyled>
        <Loading loading={loading}>
          <Row gutter={[20, 20]}>
            <Col>
              {data.pleas?.map(x => <Alert type="info" showIcon key={x.symbol} message={<><Text strong>{x.symbol}</Text> has {x.count} requests. <Link to={`/stock?create=${x.symbol}`}>Click to create</Link></>} />)}
            </Col>
            <Col>
              {data.noFairValues?.map(x => <Alert type="error" showIcon key={x} message={<><Link to={`/stock/${x}`}>{x}</Link> has no fair value.</>} />)}
            </Col>
            <Col>
              {data.noSupports?.map(x => <Alert type="error" showIcon key={x} message={<><Link to={`/stock/${x}`}>{x}</Link> has no support.</>} />)}
            </Col>
            <Col>
              {data.noResistances?.map(x => <Alert type="error" showIcon key={x} message={<><Link to={`/stock/${x}`}>{x}</Link> has no resistance.</>} />)}
            </Col>
            <Col>
              {data.oneSupports?.map(x => <Alert type="warning" showIcon key={x} message={<><Link to={`/stock/${x}`}>{x}</Link> has only one support.</>} />)}
            </Col>
            <Col>
              {data.oneResistances?.map(x => <Alert type="warning" showIcon key={x} message={<><Link to={`/stock/${x}`}>{x}</Link> has only one resistance.</>} />)}
            </Col>
          </Row>
        </Loading>
      </ContainerStyled>
    </LayoutStyled>
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
