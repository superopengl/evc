import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Icon from '@ant-design/icons';
import { RiLineChartLine } from 'react-icons/ri';
import { GiRadarSweep } from 'react-icons/gi';
import { AiOutlineNotification } from 'react-icons/ai';
import { INK_BG } from 'components/homeAreas/HomeSection';

/**
 * The shell shared by /login and /signup.
 *
 * Both pages used to be a bare 360px white column with a 64px logo on it - the only two
 * screens a signed-out visitor sees that carried none of the marketing site's language. This
 * puts them on the homepage's own two surfaces: the ink band that closes the homepage
 * (`HomeSection tone="ink"`, imported rather than re-declared so the gradient stays one
 * definition) on the left, and a paper card on the alternating `--evc-paper-sub` ground on
 * the right.
 *
 * The card's top edge is the hero's four-band gradient, which is the one literal quote of the
 * homepage here - it is what makes the pair read as the same site rather than as a generic
 * split-screen sign-in.
 *
 * Below lg the ink panel is dropped rather than stacked: it is reassurance copy, and on a
 * phone it would push the form - the reason the visitor is on the page - below the fold. The
 * logo lockup it carries reappears above the card at that width.
 */

const BRAND_BREAKPOINT = 992;

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--evc-paper-sub);

  @media (max-width: ${BRAND_BREAKPOINT - 1}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Brand = styled.aside`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  padding: clamp(48px, 5vw, 72px) clamp(40px, 4.5vw, 80px);
  background: ${INK_BG};
  color: var(--evc-on-ink);
  overflow: hidden;

  @media (max-width: ${BRAND_BREAKPOINT - 1}px) {
    display: none;
  }

  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 14px;
    text-decoration: none;
  }

  /* The square green tile, i.e. the app icon the homepage nav already uses as its logo -
     images/logo-transparent.png is dark ink on transparent and disappears on the ink panel.
     The 192px asset rather than favicon-32x32.png so it stays crisp at 44px on a 2x screen. */
  .brand-logo {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background-image: url('/android-chrome-192x192.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  /* Same treatment as the hero wordmark: Archivo set wide, tracked out, and the one place
     the letter-spacing goes positive. */
  .brand-wordmark {
    font-size: 17px;
    line-height: 1.05;
    letter-spacing: 0.12em;
    color: var(--evc-on-ink);
  }

  .brand-pitch {
    max-width: 460px;
  }

  .brand-eyebrow {
    display: block;
    color: var(--evc-signal-lift);
    margin-block-end: 16px;
  }

  h2 {
    margin: 0;
    font-size: clamp(28px, 2.9vw, 40px);
    color: var(--evc-on-ink);
  }

  .brand-points {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: clamp(28px, 3vw, 40px) 0 0;
    padding: 0;
    list-style: none;
  }

  /* The hero's SloganCard, inverted: there it is translucent white on the colour bands, here
     it is a lifted white on ink. Same 14px radius, same 34px icon tile. */
  .brand-points li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    border: 1px solid var(--evc-ink-line);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 14px;
    line-height: 1.5;
    color: var(--evc-on-ink-muted);
  }

  .brand-points .point-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--evc-signal);
    color: #ffffff;
    font-size: 17px;
  }

  .brand-legal {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 0;
    font-size: 12px;
    color: var(--evc-on-ink-faint);

    a {
      color: var(--evc-on-ink-faint);
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: var(--evc-on-ink);
        text-decoration: underline;
      }
    }
  }
`;

const FormPane = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: clamp(32px, 5vw, 64px) var(--evc-gutter);
`;

const MobileLockup = styled(Link)`
  display: none;
  align-items: center;
  gap: 12px;
  text-decoration: none;

  @media (max-width: ${BRAND_BREAKPOINT - 1}px) {
    display: flex;
  }

  .brand-logo {
    flex: none;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background-image: url('/android-chrome-192x192.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  .brand-wordmark {
    font-size: 15px;
    letter-spacing: 0.12em;
    color: var(--evc-text);
  }
`;

/**
 * Only the page-specific box. The card's own look - 18px corners, the hero strip along the top
 * edge, the padding and the heading scale - is `.evc-auth-card` in index.less, because the
 * sign-up modal on /pro-member has to be the same card and cannot reach a styled-component
 * defined in here.
 */
const Card = styled.div.attrs({ className: 'evc-auth-card' })`
  width: 100%;
  max-width: 420px;
  box-shadow: 0 18px 48px rgba(6, 32, 46, 0.08);
`;

const BackLink = styled(Link)`
  font-size: 13px;
  font-weight: 500;
  color: var(--evc-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: var(--evc-signal-deep);
    text-decoration: underline;
  }
`;

const POINTS = [
  { key: 'slogan1', icon: <RiLineChartLine /> },
  { key: 'slogan6', icon: <GiRadarSweep /> },
  { key: 'slogan7', icon: <AiOutlineNotification /> },
];

export const AuthPageShell = props => {
  const { eyebrow, title, subtitle, children } = props;

  return (
    <Page>
      <Brand>
        <Link className="brand-lockup" to="/">
          <span className="brand-logo" />
          <span className="evc-display brand-wordmark">EASY VALUE CHECK</span>
        </Link>

        <div className="brand-pitch">
          <span className="evc-eyebrow brand-eyebrow">
            <FormattedMessage id="auth.brandEyebrow" />
          </span>
          <h2 className="evc-display">
            <FormattedMessage id="home.catchPhrase" />
          </h2>
          <ul className="brand-points">
            {POINTS.map(point => (
              <li key={point.key}>
                <span className="point-icon"><Icon component={() => point.icon} /></span>
                <span><FormattedMessage id={`text.${point.key}`} /></span>
              </li>
            ))}
          </ul>
        </div>

        <p className="brand-legal">
          <span>©{new Date().getFullYear()} Easy Value Check</span>
          <a href="/terms_and_conditions" target="_blank" rel="noreferrer">
            <FormattedMessage id="menu.tc" />
          </a>
          <a href="/privacy_policy" target="_blank" rel="noreferrer">
            <FormattedMessage id="menu.pp" />
          </a>
        </p>
      </Brand>

      <FormPane>
        <MobileLockup to="/">
          <span className="brand-logo" />
          <span className="evc-display brand-wordmark">EASY VALUE CHECK</span>
        </MobileLockup>

        <Card>
          <div className="auth-head">
            {eyebrow && <span className="evc-eyebrow auth-eyebrow">{eyebrow}</span>}
            <h1 className="evc-display">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          <div className="evc-auth-form">{children}</div>
        </Card>

        <BackLink to="/">
          ← <FormattedMessage id="text.backToHome" />
        </BackLink>
      </FormPane>
    </Page>
  );
};

AuthPageShell.propTypes = {
  eyebrow: PropTypes.node,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node,
};

export default AuthPageShell;
