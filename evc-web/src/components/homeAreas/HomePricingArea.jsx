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

/* The plans float on the ink rather than sitting flat on it. The cards themselves are the
   shared SubscriptionCard, which is also used inside the logged-in app on white - so the
   elevation is applied from here, on the one band where there is a dark surface to cast
   onto, instead of being baked into the component. */
const Plans = styled.div`
  max-width: 1080px;
  margin-inline: auto;

  .ant-card {
    border: none;
    border-radius: 22px;
    box-shadow: var(--evc-lift-ink);
    transition: box-shadow 0.18s ease, transform 0.18s ease;
  }

  .ant-card.interactive:hover {
    box-shadow: 0 1px 2px rgba(0, 8, 14, 0.32), 0 26px 56px rgba(0, 8, 14, 0.42);
  }
`;

const HomePricingArea = props => {
  return (
    <HomeSection
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
