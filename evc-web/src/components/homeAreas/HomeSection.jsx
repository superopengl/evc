import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

/**
 * The shell every homepage section below the hero sits in.
 *
 * Each area used to carry its own copy of the same three rules - a centred `Container`
 * with `padding: 4rem 1rem`, an `InnerContainer` with `max-width: 1600px`, and a bare
 * antd `<Title>` - which is why the vertical rhythm drifted between them (1.5rem here,
 * 4rem there, a 6rem bottom margin on pricing). Spacing, measure and the heading scale
 * are decided once here.
 *
 *  wide   opt into --evc-measure-wide (1600px) for the full-width data boards
 *  glass  wrap the body in the floating glass pane (see Panel below)
 *
 * No section paints a background any more. The page has one continuous ink backdrop behind
 * all of them (PAGE_BACKDROP in pages/HomePage); a band here would cut a rectangle out of it.
 * The old arrangement - a tinted ramp, a texture pattern and a white edge fade per section -
 * is what made the page read as a stack of bands with a line between each one. Section type
 * is light everywhere for the same reason: below the hero there is no light ground left.
 */

/**
 * Exported: components/AuthPageShell reuses this for the /login and /signup panel, so the
 * auth screens stand on the same ink the homepage does.
 *
 * Three layers, painted back to front: a diagonal navy ramp, #013246 at the top-left down to
 * #001e2e at the bottom-right; a green glow off the top-left corner; a cyan glow off the
 * bottom-right. The two glows are the hero's own #57BB60 and #55B0D4 at low alpha.
 */
export const INK_BG = [
  'radial-gradient(1100px 560px at 12% -10%, rgba(87, 187, 96, 0.18), transparent 62%)',
  'radial-gradient(900px 520px at 92% 108%, rgba(85, 176, 212, 0.16), transparent 60%)',
  'linear-gradient(168deg, #013246 0%, #00293d 46%, #001e2e 100%)',
].join(', ');

const Outer = styled.div`
  position: relative;
  width: 100%;
  padding: var(--evc-section-y) var(--evc-gutter);
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${props => (props.$wide ? 'var(--evc-measure-wide)' : 'var(--evc-measure)')};
  margin-inline: auto;
`;

/* The header column is capped well short of the board below it: a 1600px-wide line of prose
   is unreadable, and the short measure is what makes the heading read as a label for the
   data rather than as a banner. */
const Head = styled.div`
  max-width: 720px;
  margin-inline: ${props => (props.$align === 'center' ? 'auto' : '0')};
  text-align: ${props => props.$align};
  margin-block-end: clamp(28px, 3.5vw, 44px);

  .evc-eyebrow {
    display: block;
    /* --evc-signal-deep is the on-paper green and is far too dark against the ink; the
       lifted tint is the one that clears 4.5:1 here. */
    color: var(--evc-signal-lift);
    margin-block-end: 14px;
  }

  h2 {
    margin: 0;
    font-size: clamp(26px, 3.2vw, 40px);
    color: var(--evc-on-ink);
  }

  p {
    margin: 14px 0 0;
    font-size: clamp(15px, 1.2vw, 17px);
    line-height: 1.6;
    color: var(--evc-on-ink-muted);
  }
`;

const Body = styled.div`
  width: 100%;
`;

/**
 * The floating pane the data boards sit in, opted into with `glass`.
 *
 * Light and frosted on the dark backdrop - the same relationship the /login card has with the
 * ink panel behind it. Not fully opaque: the ink and its two glows come through enough to
 * tint the sheet towards its edges, which is what keeps it from reading as a white rectangle
 * pasted on. Borderless; the edge is the blur boundary and the top highlight.
 *
 * The pages rendered inside bring their own opaque surfaces - an antd `<Card>` in the case of
 * Option Put/Call and Unusual Options Activity, and a `<Table>` whose root is
 * colorBgContainer white in all of them. Each is a white sheet the size of the pane, so they
 * are dissolved here; otherwise the glass would be a frame around an opaque rectangle. Only
 * the containers are cleared, never the tinted stock cards inside StockRadarPage - their
 * wash is meaningful.
 */
const Panel = styled.div`
  padding: clamp(16px, 2vw, 28px);
  border-radius: 26px;
  background: var(--evc-glass);
  backdrop-filter: var(--evc-glass-blur);
  -webkit-backdrop-filter: var(--evc-glass-blur);
  box-shadow: var(--evc-lift);

  > .ant-card,
  > .ant-card > .ant-card-body,
  .ant-table,
  .ant-table-container,
  .ant-table-content,
  .ant-table-summary,
  .ant-table-cell-fix-left,
  .ant-table-cell-fix-right,
  .ant-tabs-content-holder,
  .ant-spin-container,
  .ant-spin-nested-loading {
    background: transparent !important;
  }

  > .ant-card > .ant-card-body {
    padding: 0;
  }

  /* Zebra and hover fills are opaque greys out of the box, which show up as solid stripes on
     glass. Both become a wash of white instead. */
  .ant-table-tbody > tr > td {
    background: transparent;
  }

  .ant-table-tbody > tr:hover > td,
  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: rgba(255, 255, 255, 0.5) !important;
  }

  .ant-table-thead > tr > th {
    background: transparent !important;
  }

  /* StockRadarPage's stock cards. antd 6 ignores bordered={false} - it wants variant - so
     every one of them came back outlined: twelve hairline boxes inside a frameless pane,
     which is exactly the bordered-card look the pane exists to get rid of. The over/under
     valued washes are meaningful and stay, but as alpha so the pane shows through them. */
  .ant-card {
    border: none !important;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.5);
  }

  .ant-card.over-valued .ant-card-head {
    background: rgba(255, 255, 184, 0.55);
  }

  .ant-card.over-valued .ant-card-body {
    background: rgba(254, 255, 230, 0.5);
  }

  .ant-card.under-valued .ant-card-head {
    background: rgba(191, 251, 255, 0.55);
  }

  .ant-card.under-valued .ant-card-body {
    background: rgba(232, 254, 255, 0.5);
  }

  /* antd draws the card-type tab bar as grey chips on a white strip. */
  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
    background: rgba(255, 255, 255, 0.45);
    border-color: transparent;
  }

  .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
    background: rgba(255, 255, 255, 0.8);
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    background: rgba(255, 255, 255, 0.94);
  }
`;

export const HomeSection = props => {
  const { eyebrow, title, subtitle, extra, wide = false, align = 'center', glass = false, children } = props;
  const hasHead = eyebrow || title || subtitle || extra;
  const body = glass ? <Panel>{children}</Panel> : children;

  return (
    <Outer>
      <Inner $wide={wide}>
        {hasHead && (
          <Head $align={align}>
            {eyebrow && <span className="evc-eyebrow">{eyebrow}</span>}
            {title && <h2 className="evc-display">{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
            {extra}
          </Head>
        )}
        <Body>{body}</Body>
      </Inner>
    </Outer>
  );
};

HomeSection.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  extra: PropTypes.node,
  wide: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center']),
  // Wrap the body in the floating glass pane.
  glass: PropTypes.bool,
  children: PropTypes.node,
};

export default HomeSection;
