import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { listHotStock, getMarketGainers, getMarketMostActive, getMarketLosers } from 'services/stockService';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';
import PropTypes from 'prop-types';


const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
// text-align: center;
padding: 1.5rem 1rem;
// background: #fafafa;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
// max-width: 1200px;

.ant-col {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
`;


const HomeMarketArea = props => {

  const {onSymbolClick} = props;

  return (
    <Container>
      <InnerContainer>
        <Row gutter={30}>
          <Col flex="auto">
            <StockMostSearched onFetch={listHotStock} title="Most searched" onSymbolClick={onSymbolClick} />
          </Col>
          <Col flex="auto">
            <StockMostPanel onFetch={getMarketMostActive} title="Most actives" onSymbolClick={onSymbolClick} />
          </Col>
          <Col flex="auto">
            <StockMostPanel onFetch={getMarketGainers} title="Gainers" onSymbolClick={onSymbolClick} />
          </Col>
          <Col flex="auto">
            <StockMostPanel onFetch={getMarketLosers} title="Losers" onSymbolClick={onSymbolClick} />
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeMarketArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeMarketArea.defaultProps = {
  onSymbolClick: () => { }
};

export default HomeMarketArea;
