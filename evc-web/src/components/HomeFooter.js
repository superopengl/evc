import React from 'react';
import { Row, Col, Divider } from 'antd';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
// import GitInfo from 'react-git-info/macro';

// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

const FooterStyled = styled.div`
width: 100%;
text-align: center;
font-size: 0.8rem;
color: #aaaaaa;
background-color: #00293d;
padding: 2rem 1rem;
display: flex;
justify-content: center;

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
    <section id="about" style={{ maxWidth: 800 }}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <div></div>
          <p>
            All data provided on Easy Value Check is provided to individuals for informational purposes only, and is not intended for trading or investing purposes. You must not redistribute information displayed on or provided by Easy Value Check.
          </p>
          <p style={{ marginTop: 10 }}>©{new Date().getFullYear()} Easy Value Check. All right reserved.</p>
          <p><a href="https://parqet.com/api">Logos provided by Parqet</a></p>
          <p style={{ display: 'none' }}>Version {gitVersion}</p>
          <p><a href="/terms_and_conditions" target="_blank">
            <FormattedMessage id="menu.tc" />
          </a> | <a href="/privacy_policy" target="_blank">
              <FormattedMessage id="menu.pp" />
            </a> | <a href="/disclaimer" target="_blank">
              <FormattedMessage id="menu.disclaimer" />
            </a> </p>
        </Col>
      </Row>
    </section>
  </FooterStyled>
);

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
