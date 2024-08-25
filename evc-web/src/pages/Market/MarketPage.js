import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';
import { listHotStock, getMarketMost$ } from 'services/stockService';
import { timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

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

  const [loading, setLoading] = React.useState(true);
  const [mostData, setMostData] = React.useState({});

  React.useEffect(() => {
    const sub$ = timer(0, 5 * 60 * 1000).pipe(
      mergeMap(() => getMarketMost$()),
    ).subscribe(data => {
      setMostData(data || {});
      setLoading(false);
    });

    return () => sub$.unsubscribe();
  }, []);


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
          <StockMostPanel value={mostData.mostActives} loading={loading} title="Most actives" onSymbolClick={handleSymbolClick} />
        </Col>
        <Col  {...span}>
          <StockMostPanel value={mostData.gainers} loading={loading} title="Gainers" onSymbolClick={handleSymbolClick} />
        </Col>
        <Col  {...span}>
          <StockMostPanel value={mostData.losers} loading={loading} title="Losers" onSymbolClick={handleSymbolClick} />
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
