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
 *  tone   'paper' (default) | 'sub'   alternating band background
 *  wide   opt into --evc-measure-wide (1600px) for the full-width data boards
 */
const TONE_BG = {
  paper: 'var(--evc-paper)',
  sub: 'var(--evc-paper-sub)',
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
    color: var(--evc-signal-deep);
    margin-block-end: 14px;
  }

  h2 {
    margin: 0;
    font-size: clamp(26px, 3.2vw, 40px);
    color: var(--evc-text);
  }

  p {
    margin: 14px 0 0;
    font-size: clamp(15px, 1.2vw, 17px);
    line-height: 1.6;
    color: var(--evc-text-muted);
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
          <Head $align={align}>
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
  tone: PropTypes.oneOf(['paper', 'sub']),
  wide: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center']),
  children: PropTypes.node,
};

export default HomeSection;
