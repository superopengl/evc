import React from 'react';
import { Col, Row } from 'antd';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { subscriptionDef } from 'def/subscriptionDef';


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


export const SubscriptionCardRow = props => {
  return (
    <StyledRow gutter={20}>
      {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
        <SubscriptionCard 
        title={s.title}
          icon={s.icon}
          list={s.description}
          price={s.price} 
          unit={s.unit} />
      </StyledCol>)}
    </StyledRow>
  )
}

SubscriptionCardRow.propTypes = {
};

SubscriptionCardRow.defaultProps = {
};
