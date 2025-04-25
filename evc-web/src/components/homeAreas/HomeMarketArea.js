import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';
import PropTypes from 'prop-types';
import { listHotStock, getMarketMost$ } from 'services/stockService';
import { timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

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
max-width: 1600px;

.ant-col {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
`;

const span = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
};

const HomeMarketArea = props => {

  const { onSymbolClick } = props;

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

  return (
    <Container>
      <InnerContainer>
        <Row gutter={[40, 40]}>
          <Col {...span}>
            <StockMostSearched onFetch={listHotStock} title="Most searched" titleStyle={{ color: '#57BB60', textTransform: 'uppercase' }} onSymbolClick={onSymbolClick} />
          </Col>
          <Col {...span}>
            <StockMostPanel value={mostData.mostActives} loading={loading} title="Most actives" titleStyle={{ color: '#7DD487', textTransform: 'uppercase' }} onSymbolClick={onSymbolClick} />
          </Col>
          <Col {...span}>
            <StockMostPanel value={mostData.gainers} loading={loading} title="Gainers" titleStyle={{ color: '#55B0D4', textTransform: 'uppercase' }} onSymbolClick={onSymbolClick} />
          </Col>
          <Col {...span}>
            <StockMostPanel value={mostData.losers} loading={loading} title="Losers" titleStyle={{ color: '#89DFF1', textTransform: 'uppercase' }} onSymbolClick={onSymbolClick} />
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
