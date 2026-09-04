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
  width: 100%;
  padding: clamp(44px, 5vw, 68px) var(--evc-gutter);
  background: var(--evc-paper);
`;

const InnerContainer = styled.div`
  width: 100%;
  max-width: var(--evc-measure-wide);
  margin-inline: auto;
`;

/* No frame: the boards separate on the gutter and on their own header rule alone. */
const Board = styled.div`
  height: 100%;
  padding: 0 4px 8px;
  background: var(--evc-paper);
`;

const span = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
};

/**
 * The board headings were #57BB60 / #7DD487 / #55B0D4 / #89DFF1 - four brand tints picked for
 * variety, two of which (the mint and the pale cyan) land around 1.7:1 on white and were
 * effectively invisible. The colour moves to a 7px dot, so all four hues survive while the
 * label itself is ink.
 */
const TITLE_STYLE = {
  color: 'var(--evc-text)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginBottom: 14,
};

const dotStyle = color => ({
  display: 'inline-block',
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: color,
  marginInlineEnd: 9,
  verticalAlign: 'middle',
  transform: 'translateY(-1px)',
});

const HomeMarketArea = props => {

  const { onSymbolClick = () => { } } = props;

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
        <Row gutter={[24, 24]}>
          <Col {...span}>
            <Board>
              <StockMostSearched
                onFetch={listHotStock}
                title="Most searched"
                titleDot={dotStyle('#57BB60')}
                titleStyle={TITLE_STYLE}
                onSymbolClick={onSymbolClick}
              />
            </Board>
          </Col>
          <Col {...span}>
            <Board>
              <StockMostPanel
                value={mostData.mostActives}
                loading={loading}
                title="Most actives"
                titleDot={dotStyle('#7DD487')}
                titleStyle={TITLE_STYLE}
                onSymbolClick={onSymbolClick}
              />
            </Board>
          </Col>
          <Col {...span}>
            <Board>
              <StockMostPanel
                value={mostData.gainers}
                loading={loading}
                title="Gainers"
                titleDot={dotStyle('#55B0D4')}
                titleStyle={TITLE_STYLE}
                onSymbolClick={onSymbolClick}
              />
            </Board>
          </Col>
          <Col {...span}>
            <Board>
              <StockMostPanel
                value={mostData.losers}
                loading={loading}
                title="Losers"
                titleDot={dotStyle('#89DFF1')}
                titleStyle={TITLE_STYLE}
                onSymbolClick={onSymbolClick}
              />
            </Board>
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeMarketArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

export default HomeMarketArea;
