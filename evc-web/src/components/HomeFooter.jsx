import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
// import GitInfo from 'react-git-info/macro';

// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

/**
 * Same #00293d as the layout header and the sider. The type scale is what changed: the
 * disclaimer, the copyright and the legal links were all 0.8rem #aaaaaa, so a 60-word
 * legal notice carried exactly as much weight as the links people actually click.
 */
const FooterStyled = styled.footer`
width: 100%;
background-color: #00293d;
padding: clamp(48px, 6vw, 72px) var(--evc-gutter) clamp(36px, 4vw, 48px);
color: var(--evc-on-ink-muted);
font-size: 13px;
line-height: 1.65;

section {
  max-width: 760px;
  margin-inline: auto;
  text-align: center;
}

.footer-disclaimer {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--evc-on-ink-faint);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 20px;
  margin: 26px 0 0;
  padding: 22px 0 0;
  border-block-start: 1px solid var(--evc-ink-line-soft);
  font-weight: 500;
}

.footer-meta {
  margin: 18px 0 0;
  font-size: 12px;
  color: var(--evc-on-ink-faint);

  a {
    color: var(--evc-on-ink-faint);
  }
}

a {
  color: var(--evc-on-ink-muted);
  text-decoration: none;
  transition: color 0.15s ease;

  &:hover {
    color: var(--evc-on-ink);
    text-decoration: underline;
  }
}

p {
  margin-bottom: 0;
}
`;

const HomeFooter = () => (
  <FooterStyled>
    <section id="about">
      <p className="footer-disclaimer">
        All data provided on Easy Value Check is provided to individuals for informational purposes only, and is not intended for trading or investing purposes. You must not redistribute information displayed on or provided by Easy Value Check.
      </p>
      <p className="footer-links">
        <a href="/terms_and_conditions" target="_blank">
          <FormattedMessage id="menu.tc" />
        </a>
        <a href="/privacy_policy" target="_blank">
          <FormattedMessage id="menu.pp" />
        </a>
        <a href="/disclaimer" target="_blank">
          <FormattedMessage id="menu.disclaimer" />
        </a>
      </p>
      <p className="footer-meta">©{new Date().getFullYear()} Easy Value Check. All right reserved.</p>
      <p className="footer-meta"><a href="https://parqet.com/api" target="_blank" rel="noreferrer">Logos provided by Parqet</a></p>
      <p style={{ display: 'none' }}>Version {gitVersion}</p>
    </section>
  </FooterStyled>
);

HomeFooter.propTypes = {};

export default HomeFooter;
