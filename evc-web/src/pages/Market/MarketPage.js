import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';
import { listHotStock, getMarketGainers, getMarketMostActive, getMarketLosers } from 'services/stockService';


const Container = styled.div`
  .ant-table-cell {
    padding: 8px 16px !important;
  }
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
};

const MarketPage = props => {
  const handleSymbolClick = (symbol) => {
    if (symbol) {
      props.history.push(`/stock/${symbol}`);
    }
  }

  return (
    <Container>
      
    <Row gutter={[30, 50]}>
      <Col {...span}>
        <StockMostSearched onFetch={listHotStock} title="Most searched" onSymbolClick={handleSymbolClick} />
      </Col>
      <Col  {...span}>
        <StockMostPanel onFetch={getMarketMostActive} title="Most actives" onSymbolClick={handleSymbolClick} />
      </Col>
      <Col  {...span}>
        <StockMostPanel onFetch={getMarketGainers} title="Gainers" onSymbolClick={handleSymbolClick} />
      </Col>
      <Col  {...span}>
        <StockMostPanel onFetch={getMarketLosers} title="Losers" onSymbolClick={handleSymbolClick} />
      </Col>
    </Row>

    </Container>
  );
};

MarketPage.propTypes = {
};

MarketPage.defaultProps = {
};

export default withRouter(MarketPage);
