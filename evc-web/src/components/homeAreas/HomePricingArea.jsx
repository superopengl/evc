import React from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { subscriptionDef } from 'def/subscriptionDef';
import { withRouter } from 'util/withRouter';
import HomeSection from 'components/homeAreas/HomeSection';

const StyledCol = styled(Col)`
display: flex;
justify-content: center;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 8,
  xl: 8,
  xxl: 8
};

const Plans = styled.div`
  max-width: 1080px;
  margin-inline: auto;
`;

const HomePricingArea = props => {
  return (
    <HomeSection
      tone="ink"
      title="Choose the plan that's right for you"
      subtitle="Membership plans start at USD $29.00 / month"
    >
      <Plans>
        <Row gutter={[24, 24]} align="stretch">
          {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
            <SubscriptionCard
              title={s.title}
              icon={s.icon}
              description={s.description}
              price={s.price}
              interactive={true}
              unit={s.unit}
              tint={s.tint}
              onClick={() => props.history.push('/signup')}
            />
          </StyledCol>)}
        </Row>
      </Plans>
    </HomeSection>
  )
}

HomePricingArea.propTypes = {
};

export default withRouter(HomePricingArea);
