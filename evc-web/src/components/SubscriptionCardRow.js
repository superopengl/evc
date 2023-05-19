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
const { Title, Text } = Typography;


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
  const { onClick } = props;
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
