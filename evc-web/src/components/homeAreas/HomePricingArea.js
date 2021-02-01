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
padding: 2rem;
background: #f0f0f0;
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;
`;


const { Title, Text } = Typography;

export const HomePricingArea = props => {
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
                interactive={false}
                unit={s.unit} />
            </StyledCol>)}
          </StyledRow>
        </StyledRow>
      </InnerContainer>
    </Container>
  )
}

HomePricingArea.propTypes = {
};

HomePricingArea.defaultProps = {
};
