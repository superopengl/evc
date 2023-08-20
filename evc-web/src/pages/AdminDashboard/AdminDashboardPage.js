import React from 'react';
import ReactDOM from "react-dom";
import styled from 'styled-components';
import { Typography, Layout, Modal } from 'antd';
import HomeHeader from 'components/HomeHeader';
import StockList from '../../components/StockList';
import { getWatchList } from 'services/stockService';
import { Link, withRouter } from 'react-router-dom';
import { StockSearchInput } from 'components/StockSearchInput';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { notify } from 'util/notify';
import { getDashboard } from 'services/dashboardService';

const { Paragraph } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem 4rem 1rem;
width: 100%;
// max-width: 600px;
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

const AdminDashboardPage = (props) => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadList = async () => {
    try {
      setLoading(true);
      const resp = await getDashboard();

      ReactDOM.unstable_batchedUpdates(() => {
        const { data } = resp;
        setList(data ?? []);
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

        xxx
        <Paragraph type="secondary">This page lists all the stocks you have chosen to watch. You can always go to <Link to="/stock">All Stocks</Link> to find all the stocks our platform supports</Paragraph>
        <StockList data={list} loading={loading} onItemClick={stock => props.history.push(`/stock/${stock.symbol}`)} />
      </ContainerStyled>
    </LayoutStyled>
  );
};

AdminDashboardPage.propTypes = {};

AdminDashboardPage.defaultProps = {};

export default withRouter(AdminDashboardPage);
