import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { GlobalContext } from 'contexts/GlobalContext';
import StockDetailPage from './StockDetailPage';


const ContainerStyled = styled.div`
  width: 100%;

  .ant-page-header {
    padding-left: 0;
    padding-right: 0;
  }
`;

const StockPage = (props) => {
  const symbol = props.match.params.symbol;

  const context = React.useContext(GlobalContext);
  const { role } = context;

  const isAdminOrAgent = ['admin', 'agent'].includes(role);

  return (
      <ContainerStyled>
        <StockDetailPage symbol={symbol} />
      </ContainerStyled>
  );
};

StockPage.propTypes = {};

StockPage.defaultProps = {};

export default withRouter(StockPage);
