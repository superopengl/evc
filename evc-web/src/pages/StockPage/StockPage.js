import { Layout, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { GlobalContext } from 'contexts/GlobalContext';
import { updateStock, getStock, unwatchStock, watchStock } from 'services/stockService';
import { LockFilled } from '@ant-design/icons';
import ReactDOM from "react-dom";
import { listStockTags } from 'services/stockTagService';
import StockAdminPage from './StockAdminPage';
import StockFreePage from './StockFreePage';

const { Text } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem 1rem;
  width: 100%;
  // max-width: 1000px;

  // .ant-divider {
  //   margin: 8px 0 24px;
  // }

  .ant-page-header {
    padding-left: 0;
    padding-right: 0;
  }
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;


  .task-count .ant-badge-count {
    background-color: #15be53;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #15be53 inset;
  }
`;




const StockPage = (props) => {
  const symbol = props.match.params.symbol;

  const context = React.useContext(GlobalContext);
  const { role } = context;

  const isAdminOrAgent = ['admin', 'agent'].includes(role);

  return (
    <LayoutStyled>
      <HomeHeader>
      </HomeHeader>
      <ContainerStyled>
        {isAdminOrAgent ? <StockAdminPage symbol={symbol} /> : <StockFreePage symbol={symbol} />}
      </ContainerStyled>
    </LayoutStyled>
  );
};

StockPage.propTypes = {};

StockPage.defaultProps = {};

export default withRouter(StockPage);
