import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Card, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { IconContext } from "react-icons";

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
text-align: center;
height: 400px;
& .ant-card-head {
  color: #333333;
}

&.subscription-active {
box-shadow: 0 1px 2px rgba(255,0,0,0.1);
}
`;

export const SubscriptionCard = props => {
  const { onClick, title, description, icon, price, period, active } = props;



  return <IconContext.Provider value={{ size: '3rem' }}>
    <StyledCard
      className={active ? 'subscription-active' : ''}
      title={<Space direction="vertical" size="small">
        {icon}
        {title.toUpperCase()}
      </Space>}
      hoverable={true}
      onClick={onClick}
    // bodyStyle={{backgroundColor: bgColor}}
    // headerStyle={{backgroundColor: bgColor}}
    >
      <Card.Meta
        title={<div style={{display: 'flex', flexDirection: 'column'}}>
          <Text style={{ fontSize: '2.2rem', margin: '0 4px', color: '#389e0d' }}><sup><small>$</small></sup> {price}</Text>
          <Text>{period}</Text>
        </div>}
        description={description}
      ></Card.Meta>
    </StyledCard>
  </IconContext.Provider>
}

SubscriptionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.any,
  price: PropTypes.any.isRequired,
  period: PropTypes.string.isRequired,
};

SubscriptionCard.defaultProps = {
};
