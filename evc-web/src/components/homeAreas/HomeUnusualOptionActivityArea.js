import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import styled from 'styled-components';
import EarningsCalendarPage from 'pages/AdminDashboard/EarningsCalendarPage';
import { FormattedMessage } from 'react-intl';
import UnusualOptionsActivityPage from 'pages/AdminDashboard/UnusualOptionsActivityPage';

const { Title } = Typography;


const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: rgb(240, 242, 245);
// background-image: linear-gradient(-30deg, #55B0D4, #55B0D4 25%, #89DFF1 25%, #89DFF1 50%, #7DD487 50%, #7DD487 75%, #57BB60 75%, #57BB60 100%);
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
// border: 1px solid #f0f0f0;
// padding: 2rem;
// background: rgb(240, 242, 245);
// filter: contrast(0.6);
// transform: scale(0.8);

max-width: 1600px;
`;


export const HomeUnusualOptionActivityArea = props => {
  return (
    <Container>
      <Title><FormattedMessage id="menu.unusualOptionsActivity" /></Title>
      <InnerContainer>
        <UnusualOptionsActivityPage size="small" />
      </InnerContainer>
    </Container>
  )
}

HomeUnusualOptionActivityArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeUnusualOptionActivityArea.defaultProps = {
  onSymbolClick: () => { }
};

export default HomeUnusualOptionActivityArea;
