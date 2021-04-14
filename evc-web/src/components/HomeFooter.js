import React from 'react';
import { Row, Col } from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
// import GitInfo from 'react-git-info/macro';

// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

const FooterStyled = styled.div`
width: 100%;
text-align: center;
font-size: 0.9rem;
color: #aaaaaa;
background-color: #00293d;
padding: 2rem 1rem;

a {
  color: #aaaaaa;

  &:hover {
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
      <Row gutter={[20, 20]}>
        <Col flex="auto">
          <div></div>
          <p>©{new Date().getFullYear()} Easy Value Check PTY LTD. All right reserved.</p>
          <p style={{ display: 'none' }}>Version {gitVersion}</p>
          <p><a href="/terms_and_conditions" target="_blank">
            <FormattedMessage id="menu.tc" />
          </a> | <a href="/privacy_policy" target="_blank">
              <FormattedMessage id="menu.pp" />
            </a> </p>
        </Col>
        <Col flex="auto">
          Data provided by IEX Cloud <a href="https://iexcloud.io" target="_blank" rel="noreferrer">https://iexcloud.io</a>
          <br />
          <a href="https://www.techseeding.com.au/" target="_blank" rel="noopener noreferrer">
            Technical solution by TECHSEEDING https://www.techseeding.com.au
            <br />
            <img src="https://www.techseeding.com.au/logo-bw.png" width="80px" height="auto" alt="Techseeding logo"></img>
          </a>
        </Col>
      </Row>
    </section>
  </FooterStyled>
);

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
