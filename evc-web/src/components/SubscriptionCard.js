import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Card, Space, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { IconContext } from "react-icons";
import MoneyAmount from './MoneyAmount';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
text-align: center;
height: 400px;
& .ant-card-head {
  color: #333333;
}
position: relative;

&.subscription-active {
// box-shadow: 0 5px 3px rgba(255,197,61,0.8);
border: 2px solid #fa8c16;
background-color: rgba(250, 140, 22, 0.1);
transform: scale(1.05);


}

&:hover {
background-color: rgba(250, 140, 22, 0.1);
transform: scale(1.05);
}
`;

export const SubscriptionCard = props => {
  const { onClick, title, description, icon, price, unit, active } = props;



  return <IconContext.Provider value={{ size: '3rem' }}>
    <StyledCard
      className={active ? 'subscription-active' : ''}
      title={<Space direction="vertical" size="small">
        {icon}
        {title.toUpperCase()}
      </Space>}
      hoverable={!active}
      onClick={onClick}
    // bodyStyle={{backgroundColor: bgColor}}
    // headerStyle={{backgroundColor: bgColor}}
    >
      {active && <Text strong type="warning" style={{position:'absolute', right: 8, bottom: 4}}>Current plan</Text>}
      <Card.Meta
        title={<div style={{display: 'flex', flexDirection: 'column'}}>
          {/* <Text style={{ fontSize: '2.2rem', margin: '0 4px', color: '#15be53' }}><sup><small>$</small></sup> {price}</Text> */}
          <MoneyAmount  style={{ fontSize: '2.2rem', margin: '0 4px'}} type="success" value={price} />
          <Text>{unit}</Text>
        </div>}
        description={description}
      ></Card.Meta>
    </StyledCard>
  </IconContext.Provider>
}

SubscriptionCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.any,
  price: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
  active: PropTypes.bool
};

SubscriptionCard.defaultProps = {
  active: false
};
