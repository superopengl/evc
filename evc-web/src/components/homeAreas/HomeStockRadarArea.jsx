import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import styled from 'styled-components';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import HomeSection from 'components/homeAreas/HomeSection';

/**
 * The preview caveat used to be an antd `<Alert type="success">`, which put a green panel
 * around the whole description and gave a secondary note the loudest surface on the page.
 * It is a single tinted line now, so the emphasis order is title -> description -> caveat.
 */
const PreviewNote = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-block-start: 20px;
  padding: 7px 14px;
  border: 1px solid rgba(87, 187, 96, 0.3);
  border-radius: 999px;
  background: var(--evc-signal-wash);
  font-size: 13px;
  font-weight: 500;
  color: var(--evc-signal-deep);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--evc-signal);
  }
`;

const Cta = styled.div`
  margin-block-start: 22px;

  .ant-btn {
    min-width: 168px;
    height: 42px;
    font-size: 15px;
  }
`;

/* The board keeps a panel of its own so the dense card grid reads as one object against the
   band, but as white-on-tint with a soft edge rather than the old grey-on-white slab. */
const Board = styled.div`
  padding: clamp(12px, 1.6vw, 22px);
  border: 1px solid var(--evc-line);
  border-radius: 18px;
  background: var(--evc-paper);
  box-shadow: 0 18px 44px rgba(16, 34, 44, 0.05);
`;

export const HomeStockRadarArea = props => {
  const { onSymbolClick = () => { } } = props;
  return (
    <HomeSection
      tone="sub"
      wide
      title={<FormattedMessage id="menu.stockRadar" />}
      subtitle={<FormattedMessage id="text.stockRadarDescription" />}
      extra={<>
        <PreviewNote>
          <FormattedMessage id="text.stockRadarPreviewDescription" />
        </PreviewNote>
        <Cta>
          <Link to="/signup">
            <Button type="primary">
              <FormattedMessage id="menu.signUpNow" />
            </Button>
          </Link>
        </Cta>
      </>}
    >
      <Board>
        <StockRadarPage onItemClick={onSymbolClick} size={12} />
      </Board>
    </HomeSection>
  )
}

HomeStockRadarArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

export default HomeStockRadarArea;
