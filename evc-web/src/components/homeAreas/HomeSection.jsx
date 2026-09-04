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
 * are decided once here and read from the --evc-* tokens in index.less.
 *
 *  tone   'paper' (default) | 'sub' | 'signal' | 'tide' | 'mint' | 'ink'   band background
 *  wide   opt into --evc-measure-wide (1600px) for the full-width data boards
 *
 * paper and sub alternate down the page. 'ink' is the one dark band, built around the #00293d
 * of the nav and the footer, and it is deliberately used once, on pricing, so the plans read
 * as the page's closing statement rather than as one more white section.
 *
 * ink is not flat. Three layers, painted back to front:
 *   1. a diagonal navy ramp, #013246 at the top-left down to #001e2e at the bottom-right,
 *      which also hands off cleanly to the darker footer below it;
 *   2. a green glow off the top-left corner;
 *   3. a cyan glow off the bottom-right.
 * The two glows are the hero's own #57BB60 and #55B0D4 at low alpha, so the band closes the
 * page on the same two colours it opened with.
 */
// Exported: components/AuthPageShell reuses this band for the /login and /signup panel,
// so the two auth screens sit on the same ink as the homepage's closing section.
export const INK_BG = [
  'radial-gradient(1100px 560px at 12% -10%, rgba(87, 187, 96, 0.18), transparent 62%)',
  'radial-gradient(900px 520px at 92% 108%, rgba(85, 176, 212, 0.16), transparent 60%)',
  'linear-gradient(168deg, #013246 0%, #00293d 46%, #001e2e 100%)',
].join(', ');

/**
 * The three data sections each get a tinted wash rather than a neutral grey. Four layers,
 * front to back:
 *
 *   1. EDGE_FADE  - white at the very top and bottom edge of the band, easing out over 140px.
 *                   This is what keeps section boundaries from being a hard line: two
 *                   adjacent bands meet through near-white instead of tint-against-tint.
 *   2. pattern    - a faint market/instrument motif, one per section (see PATTERN).
 *   3. glow       - an off-canvas radial in the band's own hue.
 *   4. ramp       - the diagonal tint itself.
 *
 * Hue alternates green -> cyan -> mint down the page. Three genuinely distinct tints are not
 * available from a two-hue palette, so the rule is that *adjacent* bands never share a hue -
 * signal and mint are both green-family but Option Put/Call sits between them. The pattern
 * and the glow corner differ in all three, which is what stops the pale bands from reading
 * as a repeat.
 */

// Fixed px, not a percentage: these sections range from ~700px to well over 2000px tall, and
// a percentage fade would be a 20px hairline on one and a 400px wash on another.
const EDGE_FADE = [
  'linear-gradient(180deg,',
  '#ffffff 0px, rgba(255, 255, 255, 0) 140px,',
  'rgba(255, 255, 255, 0) calc(100% - 140px), #ffffff 100%)',
].join(' ');

// Ink at 3-5% - legible as texture at arm's length, invisible as a distraction behind data.
const PATTERN = {
  // Radar sweep: concentric rings struck from the same corner the glow comes from.
  signal: 'repeating-radial-gradient(circle at 15% 0%, rgba(6, 32, 46, 0.045) 0 1px, transparent 1px 64px)',
  // Chart grid.
  tide: [
    'repeating-linear-gradient(0deg, rgba(6, 32, 46, 0.04) 0 1px, transparent 1px 48px)',
    'repeating-linear-gradient(90deg, rgba(6, 32, 46, 0.04) 0 1px, transparent 1px 48px)',
  ].join(', '),
  // Order flow: diagonal hatch.
  mint: 'repeating-linear-gradient(45deg, rgba(6, 32, 46, 0.035) 0 1px, transparent 1px 14px)',
};

const wash = (tone, glow, corner, from, mid, to) => [
  EDGE_FADE,
  PATTERN[tone],
  `radial-gradient(900px 460px at ${corner}, ${glow}, transparent 62%)`,
  `linear-gradient(170deg, ${from} 0%, ${mid} 55%, ${to} 100%)`,
].join(', ');

const TONE_BG = {
  paper: 'var(--evc-paper)',
  sub: 'var(--evc-paper-sub)',
  signal: wash('signal', 'rgba(87, 187, 96, 0.13)', '15% 0%', '#eef8f0', '#e9f5ec', '#f3faf5'),
  tide: wash('tide', 'rgba(85, 176, 212, 0.14)', '85% 0%', '#ecf6fc', '#e7f2fa', '#f2f9fd'),
  mint: wash('mint', 'rgba(125, 212, 135, 0.16)', '20% 100%', '#f0faf2', '#eaf7ee', '#f5fbf7'),
  ink: INK_BG,
};

const Outer = styled.div`
  width: 100%;
  padding: var(--evc-section-y) var(--evc-gutter);
  /* The tone change is the only separator. Sections alternate paper / sub all the way down,
     so every boundary already reads as one - a rule on top of it just doubles the edge. */
  background: ${props => TONE_BG[props.$tone] || TONE_BG.paper};
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${props => (props.$wide ? 'var(--evc-measure-wide)' : 'var(--evc-measure)')};
  margin-inline: auto;
`;

/* The header column is capped well short of the board below it: a 1600px-wide
   line of prose is unreadable, and the short measure is what makes the heading
   read as a label for the data rather than as a banner. */
const Head = styled.div`
  max-width: 720px;
  margin-inline: ${props => (props.$align === 'center' ? 'auto' : '0')};
  text-align: ${props => props.$align};
  margin-block-end: clamp(28px, 3.5vw, 44px);

  .evc-eyebrow {
    display: block;
    /* The deep green is there to clear 4.5:1 on paper; on ink it is too dark, so the
       lifted tint takes over. */
    color: ${props => (props.$tone === 'ink' ? 'var(--evc-signal-lift)' : 'var(--evc-signal-deep)')};
    margin-block-end: 14px;
  }

  h2 {
    margin: 0;
    font-size: clamp(26px, 3.2vw, 40px);
    color: ${props => (props.$tone === 'ink' ? 'var(--evc-on-ink)' : 'var(--evc-text)')};
  }

  p {
    margin: 14px 0 0;
    font-size: clamp(15px, 1.2vw, 17px);
    line-height: 1.6;
    color: ${props => (props.$tone === 'ink' ? 'var(--evc-on-ink-muted)' : 'var(--evc-text-muted)')};
  }
`;

const Body = styled.div`
  width: 100%;
`;

export const HomeSection = props => {
  const { eyebrow, title, subtitle, extra, tone = 'paper', wide = false, align = 'center', children } = props;
  const hasHead = eyebrow || title || subtitle || extra;

  return (
    <Outer $tone={tone}>
      <Inner $wide={wide}>
        {hasHead && (
          <Head $align={align} $tone={tone}>
            {eyebrow && <span className="evc-eyebrow">{eyebrow}</span>}
            {title && <h2 className="evc-display">{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
            {extra}
          </Head>
        )}
        <Body>{children}</Body>
      </Inner>
    </Outer>
  );
};

HomeSection.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  extra: PropTypes.node,
  tone: PropTypes.oneOf(['paper', 'sub', 'signal', 'tide', 'mint', 'ink']),
  wide: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center']),
  children: PropTypes.node,
};

export default HomeSection;
