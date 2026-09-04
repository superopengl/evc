import React from 'react';
import { withRouter } from 'util/withRouter';
import styled from 'styled-components';
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

  return (
      <ContainerStyled>
        <StockDetailPage symbol={symbol} />
      </ContainerStyled>
  );
};

StockPage.propTypes = {};

export default withRouter(StockPage);
