import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Col, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';


const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
};

const Container = styled.div`
justify-content: center;
margin-bottom: 0rem;
width: 100%;
text-align: center;
padding: 2rem 0;
background: #f5f5f5;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;
`;


const { Title, Text } = Typography;

export const SubscriptionArea = props => {
  const {onClick} = props;
  return (
    <Container>
      <InnerContainer>
        <StyledRow gutter={20}>
          <StyledCol {...span}>
            <SubscriptionCard title="Free" 
            icon={<GiCurvyKnife/>}
            list="Search history data. Forever free. Goot to start with for students and trail users."
            price="0" period="forever" bgColor="#ffffff" />
          </StyledCol>
          <StyledCol {...span}>
            <SubscriptionCard title="Single" 
            icon={<GiFireAxe/>} 
            list="Tracking one stock. Concentrating to single stock with the updated recommendations."
            price={20} period="per month" bgColor="#ffffff" />
          </StyledCol>
          <StyledCol {...span}>
            <SubscriptionCard title="Unlimited Month" 
            icon={<GiSawedOffShotgun/>}
            list="Tracking unlimited stocks per month. Best for professtional investor as a trial."
             price={39} period="per month" bgColor="#d9f7be" />
          </StyledCol>
          <StyledCol {...span}>
            <SubscriptionCard title="Unlimited Quarter" 
            icon={<GiPirateCannon />} 
            list="Tracking unlimited stocks per quater. Money saver for porfessinal investors."
            price={99} period="per quarter" bgColor="#73d13d" />
          </StyledCol>
        </StyledRow>
      </InnerContainer>
    </Container>
  )
}

SubscriptionArea.propTypes = {
};

SubscriptionArea.defaultProps = {
};
