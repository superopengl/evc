import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Col, Row } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';


const StyledRow = styled(Row)`
  margin-top: 10px;
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

export const HomeSubscriptionArea = props => {
  const { onClick } = props;
  return (
    <Container>
      <InnerContainer>
        <StyledRow gutter={20}>
          <StyledRow gutter={20}>
            {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
              <SubscriptionCard
                title={s.title}
                icon={s.icon}
                description={s.description}
                price={s.price}
                period={s.period} />
            </StyledCol>)}
          </StyledRow>
        </StyledRow>
      </InnerContainer>
    </Container>
  )
}

HomeSubscriptionArea.propTypes = {
};

HomeSubscriptionArea.defaultProps = {
};