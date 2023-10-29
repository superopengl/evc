import React from 'react';
import styled from 'styled-components';
import { Typography, Divider } from 'antd';
import { Logo } from 'components/Logo';
const ContainerStyled = styled.div`
padding: 2rem 1rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 900px;
font-size: 0.9rem;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}
`;
const { Title } = Typography;
const DisclaimerPage = () => (
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center' }}>Easy Value Check Pty Ltd - Disclaimer</Title>
    <p>
    No Investment Advice Provided

    </p>
    <p>
    Any opinions, charts, messages, news, research, analyses, prices, or other information contained on this Website are provided as general market information for educational and entertainment purposes only, and do not constitute investment advice. The website should not be relied upon as a substitute for extensive independent market research before making your actual trading decisions. Opinions, market data, recommendations or any other content is subject to change at any time without notice. EVC will not accept liability for any loss or damage, including without limitation any loss of profit, which may arise directly or indirectly from use of or reliance on such information.
    </p>
    <p>
    We do not recommend the use of technical analysis as a sole means of trading decisions. We do not recommend making hurried trading decisions. You should always understand that PAST PERFORMANCE IS NOT NECESSARILY INDICATIVE OF FUTURE RESULTS.

    </p>
    <p>
    This Website should be used for personal only, not for commercial use.
    </p>
    <p>
    You are responsible to ensure all the personal information that you have provided is true and reliable. On your own risk upon getting your commission rewards as a referrer in breach of our referral program rules. EVC has the final rights to cancel or refuse your commission withdrawal at any time at its sole discretion upon any false or inconsistent personal information that you have provided above.
    </p>
    
  </ContainerStyled>

);

DisclaimerPage.propTypes = {};

DisclaimerPage.defaultProps = {};

export default DisclaimerPage;
