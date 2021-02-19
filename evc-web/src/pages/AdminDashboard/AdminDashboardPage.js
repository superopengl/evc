import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Row, Col, Card, Badge, Alert } from 'antd';
import HomeHeader from 'components/HomeHeader';
import StockList from '../../components/StockList';
import { getWatchList } from 'services/stockService';
import { Link, withRouter } from 'react-router-dom';
import { StockSearchInput } from 'components/StockSearchInput';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { notify } from 'util/notify';
import { getDashboard } from 'services/dashboardService';

const { Text, Title, Paragraph } = Typography;

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

const StyledBadge = styled(Badge)`

  .ant-badge-count {
    color: #999;
    background-color: #fff;
    box-shadow: 0 0 0 1px #d9d9d9 inset;
  }
`;
const StockTile = props => <StyledBadge count={props.count}>
  <Card size="small">
    {props.symbol}
  </Card>
</StyledBadge>

const AdminDashboardPage = (props) => {

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

  const handleSelectedStock = (symbol) => {
    props.history.push(`/stock/${symbol}`);
  }

  return (
    <LayoutStyled>
      <HomeHeader>
      </HomeHeader>
      <ContainerStyled>

        <Row gutter={[20, 20]}>
          <Col>
            {data.pleas?.map(x => <Alert type="info" showIcon key={x.symbol} message={<><Text strong>{x.symbol}</Text> has {x.count} requests.</>} />)}
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
      </ContainerStyled>
    </LayoutStyled>
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
