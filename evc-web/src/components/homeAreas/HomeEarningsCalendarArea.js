import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Col, Row, Button, Alert, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';
import StockRadarPage from 'pages/Stock/StockRadarPage';
import { Link, withRouter } from 'react-router-dom';
import EarningsCalendarPage from 'pages/AdminDashboard/EarningsCalendarPage';

const { Text, Title } = Typography;

const StyledRow = styled(Row)`
  margin-top: 10px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 8,
  xl: 8,
  xxl: 8
};

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 4rem 1rem;
// background: rgb(240, 242, 245);
// background-image: linear-gradient(-30deg, #18b0d7, #18b0d7 25%, #67ddf0 25%, #67ddf0 50%, #5dd982 50%, #5dd982 75%, #15be53 75%, #15be53 100%);
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

// max-width: 1200px;
`;


export const HomeEarningsCalendarArea = props => {
  const { onSymbolClick } = props;
  return (
    <Container>
      <Title>Earnings Calendar - Preview</Title>
      <InnerContainer>
        <EarningsCalendarPage onSymbolClick={onSymbolClick}/>
      </InnerContainer>
    </Container>
  )
}

HomeEarningsCalendarArea.propTypes = {
  onSymbolClick: PropTypes.func,
};

HomeEarningsCalendarArea.defaultProps = {
  onSymbolClick: () => { }
};

export default HomeEarningsCalendarArea;
