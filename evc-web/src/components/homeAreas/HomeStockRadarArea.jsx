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
  border-radius: 999px;
  background: rgba(87, 187, 96, 0.16);
  font-size: 13px;
  font-weight: 500;
  color: var(--evc-signal-lift);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--evc-signal-lift);
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

export const HomeStockRadarArea = props => {
  const { onSymbolClick = () => { } } = props;
  return (
    <HomeSection
      wide
      glass
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
      <StockRadarPage onItemClick={onSymbolClick} size={12} />
    </HomeSection>
  )
}

HomeStockRadarArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

export default HomeStockRadarArea;
