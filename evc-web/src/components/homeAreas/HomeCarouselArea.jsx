import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Row, Col, Listy, Image } from 'antd';
import { withRouter } from 'util/withRouter';
import GoogleSsoButton from 'components/GoogleSsoButton';
import { SearchStockInput } from 'components/SearchStockInput';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Icon from '@ant-design/icons';
import { GiRadarSweep } from 'react-icons/gi';
import { AiOutlineNotification } from 'react-icons/ai';
import { BsCalendar, BsArrowBarUp } from 'react-icons/bs';
import { RiLineChartLine } from 'react-icons/ri';

const { Text, Paragraph } = Typography;

/**
 * The original four brand bands, unchanged: #89DFF1 / #55B0D4 / #7DD487 / #57BB60, hard stops
 * at 25 / 50 / 75 on a -45deg axis. No blend between them and no white overlay on top - the
 * four colours are flat.
 *
 * All hero text is ink rather than white: the pale cyan band put white body copy under 2:1,
 * and ink clears 6:1 on every one of the four.
 */
const Container = styled.div`
  position: relative;
  width: 100%;
  padding: clamp(92px, 10vw, 132px) var(--evc-gutter) clamp(56px, 7vw, 92px);
  background-image: linear-gradient(-45deg,
    #89dff1, #89dff1 25%,
    #55b0d4 25%, #55b0d4 50%,
    #7dd487 50%, #7dd487 75%,
    #57bb60 75%, #57bb60 100%);

  /* The search field is the one control on a coloured ground, so it gets a solid white
     fill rather than the 0.8 alpha it used to have - translucent white over four different
     band colours meant the placeholder sat on a different tint at every breakpoint. */
  .ant-select-selector {
    background-color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: 0 10px 30px rgba(6, 32, 46, 0.16) !important;
    padding: 0 18px !important;

    .ant-select-selection-search {
      inset-inline-start: 18px;
    }
  }

  .ant-select-focused .ant-select-selector {
    box-shadow: 0 10px 30px rgba(6, 32, 46, 0.16), 0 0 0 3px rgba(255, 255, 255, 0.6) !important;
  }
`;

const InnerContainer = styled.div`
  width: 100%;
  max-width: var(--evc-measure);
  margin-inline: auto;
`;

const Lockup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  /* Wordmark. Archivo set wide and tracked out is the one place on the page the
     letter-spacing goes positive - it is a logotype, not a heading. */
  .evc-wordmark {
    margin: 20px 0 0;
    /* nowrap plus a clamp that stays inside the half-column: at the lg breakpoint the
       lockup only has ~456px, and the wordmark broke across two lines there. */
    white-space: nowrap;
    font-size: clamp(20px, 2.9vw, 36px);
    line-height: 1.05;
    letter-spacing: 0.1em;
    text-indent: 0.1em;
    color: var(--evc-ink);
  }

  .evc-catch-phrase.ant-typography {
    margin: 12px 0 0;
    max-width: 460px;
    font-size: clamp(15px, 1.5vw, 18px);
    font-weight: 500;
    line-height: 1.5;
    color: rgba(6, 32, 46, 0.72);
  }
`;

const SearchSlot = styled.div`
  width: 100%;
  max-width: 420px;
  margin: clamp(24px, 3vw, 34px) 0 20px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
`;

/**
 * Solid ink rather than the theme green: the primary action used to be #57BB60 on a #57BB60
 * band, which left the highest-intent button on the page all but invisible. #06202e is the
 * same ink as the header, footer and sider, so it stays inside the existing palette.
 */
const SignUpButton = styled(Button)`
  &&& {
    width: 195px;
    height: 40px;
    background: var(--evc-ink);
    border-color: var(--evc-ink);
    color: #ffffff;
    box-shadow: 0 8px 22px rgba(6, 32, 46, 0.22);

    &:hover {
      background: var(--evc-ink-raise);
      border-color: var(--evc-ink-raise);
      color: #ffffff;
    }
  }
`;

// List -> Listy. styled() still applies for the container metrics; the item rules move to
// Listy's styles.item, which also has to switch off the divider Listy draws by default.
const StyledList = styled(Listy)`
  max-width: 560px;
  margin-inline: auto;
`;

const SLOGAN_ITEM_STYLE = { border: 'none', padding: '5px 0', background: 'transparent' };

/**
 * Each slogan is a translucent card instead of bare white text. Two reasons: white body copy
 * over #89DFF1 was under 2:1, and the cards give the right-hand column an edge, so it reads
 * as a list of capabilities rather than as text floating on the artwork.
 */
const SloganCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(6px);
  transition: background 0.18s ease, border-color 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.62);
    border-color: rgba(255, 255, 255, 0.85);
  }

  .slogan-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--evc-ink);
    color: #ffffff;
    font-size: 17px;
  }

  .slogan-text.ant-typography {
    font-size: 14.5px;
    font-weight: 500;
    line-height: 1.5;
    color: rgba(6, 32, 46, 0.86);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12,
};

const HomeCarouselAreaRaw = props => {

  const { onSymbolClick = () => { } } = props;

  const handleSignOn = () => {
    props.history.push('/signup')
  }

  const handleSearchChange = symbol => {
    if (symbol) {
      onSymbolClick(symbol);
    }
  }

  const data = [
    {
      icon: <Icon component={() => <RiLineChartLine />} />,
      key: 'slogan1',
      description: <FormattedMessage id="text.slogan1" />,
    },
    {
      icon: <Icon component={() => <BsArrowBarUp />} />,
      key: 'slogan2',
      description: <FormattedMessage id="text.slogan2" />,
    },
    {
      icon: <Icon component={() => <BsCalendar />} />,
      key: 'slogan5',
      description: <FormattedMessage id="text.slogan5" />,
    },
    {
      icon: <Icon component={() => <GiRadarSweep />} />,
      key: 'slogan6',
      description: <FormattedMessage id="text.slogan6" />,
    },
    {
      icon: <Icon component={() => <AiOutlineNotification />} />,
      key: 'slogan7',
      description: <FormattedMessage id="text.slogan7" />,
    },
  ];


  return (
    <Container>
      <InnerContainer>
        <Row gutter={[48, 48]} style={{ alignItems: 'center' }}>
          <Col className="signup-panel" {...span}>
            <Lockup>
              <Image src="/images/logo-transparent.png" style={{ width: 132 }} preview={false} />
              <h1 className="evc-display evc-wordmark">EASY VALUE CHECK</h1>
              <Paragraph className="evc-catch-phrase">
                <FormattedMessage id="home.catchPhrase" />
              </Paragraph>

              <SearchSlot>
                <SearchStockInput size="large" onChange={handleSearchChange} traceSearch={true} />
              </SearchSlot>

              <Actions>
                <SignUpButton type="primary" onClick={() => handleSignOn()}>
                  <FormattedMessage id="button.signUpWithEmail" />
                </SignUpButton>
                <GoogleSsoButton width={195} />
              </Actions>
            </Lockup>
          </Col>
          <Col {...span}>
            <StyledList
              items={data}
              rowKey="key"
              styles={{ item: SLOGAN_ITEM_STYLE }}
              itemRender={item => (
                <SloganCard>
                  <span className="slogan-icon">{item.icon}</span>
                  <Text className="slogan-text">{item.description}</Text>
                </SloganCard>
              )}
            />
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  );
}

HomeCarouselAreaRaw.propTypes = {
  onSymbolClick: PropTypes.func,
};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
