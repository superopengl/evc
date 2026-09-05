import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';
import StockMostPanel from 'components/StockMostPanel';
import StockMostSearched from 'components/StockMostSearched';
import PropTypes from 'prop-types';
import { listHotStock, getMarketMost$ } from 'services/stockService';
import { timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * The band the four boards sit on. No background of its own - the page backdrop runs behind
 * this like it does behind everything else below the hero.
 *
 * The boards used to be pulled up into the hero on a negative margin, from when the page
 * below it was white and the glass needed the gradient behind it to read as glass. The page
 * is ink now, so the panes read on their own and the overlap only crowded the hero. They get
 * the same clear air any other section gets instead.
 */
const Container = styled.div`
  position: relative;
  width: 100%;
  padding: clamp(56px, 6vw, 96px) var(--evc-gutter) clamp(44px, 5vw, 68px);
`;

const InnerContainer = styled.div`
  width: 100%;
  max-width: var(--evc-measure-wide);
  margin-inline: auto;
`;

/* Each board is its own pane. They used to be frameless columns on white, which left the
   four lists reading as one undivided wall of tickers the moment the window got narrow. */
const Board = styled.div`
  height: 100%;
  padding: 20px 20px 12px;
  border-radius: 26px;
  background: var(--evc-glass-strong);
  backdrop-filter: var(--evc-glass-blur);
  -webkit-backdrop-filter: var(--evc-glass-blur);
  box-shadow: var(--evc-lift);
  transition: box-shadow 0.18s ease, transform 0.18s ease;

  /* The cells are already transparent (see StockMostPanel), but the table root itself is
     antd's colorBgContainer - an opaque white sheet that filled the pane and left only the
     18px of padding reading as glass. */
  .ant-table,
  .ant-table-placeholder .ant-table-cell,
  .ant-spin-container,
  .ant-spin-nested-loading {
    background: transparent !important;
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(255, 255, 255, 0.45) !important;
  }

  &:hover {
    box-shadow: var(--evc-lift-hover);
    transform: translateY(-2px);
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(255, 255, 255, 0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
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
