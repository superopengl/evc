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
 * at 25 / 50 / 75 on a -45deg axis. No blend between them, and everything layered over them is
 * translucent precisely so they stay the loudest thing on the page. This is the brand
 * signature; nothing here dims it, and it runs full strength to the bottom edge.
 *
 * The header above is glass now rather than a green slab, so the gradient runs to the top of
 * the viewport - hence the taller top padding, which is what keeps the lockup clear of the
 * bar while letting the bands read at full height behind it.
 *
 * All hero text is ink rather than white: the pale cyan band put white body copy under 2:1,
 * and ink clears 6:1 on every one of the four.
 */
const Container = styled.div`
  position: relative;
  width: 100%;
  padding: clamp(116px, 12vw, 168px) var(--evc-gutter) clamp(76px, 9vw, 124px);

  /**
   * The bottom edge is a clean cut, not a fade. Two versions of a fade were tried - an
   * ink-coloured overlay, then a mask down to transparent - and both dragged the two bright
   * greens through the navy on the way down, which comes out as a band of olive sludge. The
   * bands are saturated and the page below is dark; there is no intermediate state between
   * them that is not muddy, so the two surfaces just meet.
   *
   * There is no white veil over the bands either. A soft bloom used to sit behind the lockup
   * to lift the type off whichever band it landed on, but white over a saturated green comes
   * out chalky, and ink type on top of that read as grey-on-grey rather than as black on
   * green. The bands are clean and the type carries its own contrast instead.
   */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: linear-gradient(-45deg,
      #89dff1, #89dff1 25%,
      #55b0d4 25%, #55b0d4 50%,
      #7dd487 50%, #7dd487 75%,
      #57bb60 75%, #57bb60 100%);
  }

  /* The bands are on a pseudo-element, so the content has to sit above it. */
  > * {
    position: relative;
    z-index: 1;
  }

  /* The search field is glass like everything else in the hero: a near-opaque white pane so
     the placeholder holds, blurred so the band behind it stays visible at the edges. */
  .ant-select-selector {
    background-color: rgba(255, 255, 255, 0.72) !important;
    backdrop-filter: var(--evc-glass-blur);
    -webkit-backdrop-filter: var(--evc-glass-blur);
    border-color: transparent !important;
    border-radius: 16px !important;
    box-shadow: 0 1px 2px rgba(6, 32, 46, 0.06), 0 14px 34px rgba(6, 32, 46, 0.16) !important;
    padding: 0 18px !important;

    .ant-select-selection-search {
      inset-inline-start: 18px;
    }
  }

  .ant-select-focused .ant-select-selector {
    background-color: rgba(255, 255, 255, 0.96) !important;
    box-shadow: 0 14px 34px rgba(6, 32, 46, 0.16), 0 0 0 3px rgba(255, 255, 255, 0.7) !important;
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

  /* Solid, not ink at 0.72. Translucent black over a saturated band does not read as a
     lighter black - it mixes with the green and lands on olive, which is what made the line
     under the wordmark look dirty. Every colour in this lockup is opaque for that reason;
     the hierarchy comes from weight and size rather than from alpha. */
  .evc-catch-phrase.ant-typography {
    margin: 12px 0 0;
    max-width: 460px;
    font-size: clamp(15px, 1.5vw, 18px);
    font-weight: 500;
    line-height: 1.5;
    color: var(--evc-ink-raise);
  }
`;

/**
 * The search field and the two buttons under it form one stack, so they are sized off a
 * single set of numbers rather than each carrying its own. The search box used to be a
 * round 420px against a 402px button row, which left it visibly 18px proud on either side.
 *
 * Google renders its own button and only takes a pixel `width`, so ACTION_WIDTH has to be
 * passed to it as a number as well as used in CSS here.
 */
const ACTION_WIDTH = 195;
const ACTION_GAP = 12;
const STACK_WIDTH = ACTION_WIDTH * 2 + ACTION_GAP;

const SearchSlot = styled.div`
  width: 100%;
  max-width: ${STACK_WIDTH}px;
  margin: clamp(24px, 3vw, 34px) 0 20px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${ACTION_GAP}px;
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
  padding: 16px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.34);
  /* saturate before blur: averaging the four bands behind the pane washes them out, and the
     saturate pushes the chroma back so the glass still reads as green or cyan, not grey. */
  backdrop-filter: var(--evc-glass-blur);
  -webkit-backdrop-filter: var(--evc-glass-blur);
  /* The inset highlight is the top edge catching light - it is what makes the pane read as
     having thickness rather than as a flat translucent rectangle. */
  box-shadow: var(--evc-glass-edge), 0 2px 6px rgba(6, 32, 46, 0.04),
    0 16px 34px rgba(6, 32, 46, 0.1);
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 6px rgba(6, 32, 46, 0.05),
      0 26px 52px rgba(6, 32, 46, 0.14);
    transform: translateY(-2px);
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
    color: var(--evc-ink);
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
                {/*
                  * Dark, not the theme green: the primary action used to be #57BB60 on a
                  * #57BB60 band, which left the highest-intent button on the page all but
                  * invisible. The gradient runs teal -> ink -> deep green, so it picks up
                  * both hero hues while every stop stays dark enough to hold white text.
                  *
                  * classNames/styles are antd 6's semantic API - the supported way to reach a
                  * component's root node without wrapping it in styled(). Note the Button
                  * itself has no gradient feature: `color` only takes the preset palette
                  * names (primary, blue, red...) and there is no gradient design token, so
                  * the fill is CSS on the root either way. The width is passed through
                  * `styles` because it comes from the JS constant the Google button is also
                  * sized from; everything with a hover state lives in the class.
                  */}
                <Button
                  type="primary"
                  classNames={{ root: 'evc-hero-cta' }}
                  styles={{ root: { width: ACTION_WIDTH } }}
                  onClick={() => handleSignOn()}
                >
                  <FormattedMessage id="button.signUpWithEmail" />
                </Button>
                <GoogleSsoButton width={ACTION_WIDTH} />
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
