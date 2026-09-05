import React from 'react';
import styled from 'styled-components';
import { Row, Col, Card } from 'antd';
import { withRouter } from 'util/withRouter';
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

/**
 * The four boards used to sit frameless in bare <Col>s, so each table bled straight into the
 * page gutter with no inset of its own. A Card gives them the surface and body padding the
 * rest of the admin pages use, and the heading moves to the card header - hence no `title`
 * prop on the panels any more, or every board would carry two.
 *
 * height: 100% is what keeps the four level: the tables are different lengths (Most searched
 * returns 5 rows, the others ~30), and Col stretches but Card does not, so without it each
 * card shrink-wraps its own table.
 */
const Board = styled(Card)`
  height: 100%;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 6
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
      <Row gutter={[24, 24]}>
        <Col {...span}>
          <Board title="Most searched">
            <StockMostSearched onFetch={listHotStock} onSymbolClick={handleSymbolClick} />
          </Board>
        </Col>
        <Col  {...span}>
          <Board title="Most actives">
            <StockMostPanel value={mostData.mostActives} loading={loading} onSymbolClick={handleSymbolClick} />
          </Board>
        </Col>
        <Col  {...span}>
          <Board title="Gainers">
            <StockMostPanel value={mostData.gainers} loading={loading} onSymbolClick={handleSymbolClick} />
          </Board>
        </Col>
        <Col  {...span}>
          <Board title="Losers">
            <StockMostPanel value={mostData.losers} loading={loading} onSymbolClick={handleSymbolClick} />
          </Board>
        </Col>
      </Row>

    </Container>
  );
};

MarketPage.propTypes = {
};

export default withRouter(MarketPage);
