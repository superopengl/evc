import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Card, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { IconContext } from "react-icons";

const StyledCard = styled(Card)`
  text-align: center;
`;

const { Title, Text } = Typography;

export const SubscriptionCard = props => {
  const { onClick, title, list, icon, price, period, bgColor } = props;

  const StyledCard = styled(Card)`
text-align: center;
// color: ${bgColor} !important;
  & .ant-card-head {
    color: #333333;
  }
`;

  return <IconContext.Provider value={{ size: '3rem' }}>
    <StyledCard
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
          <Text style={{ fontSize: '3rem', margin: '0 4px', color: '#389e0d' }}><sup>$</sup> {price}.00</Text>
          <Text>{period}</Text>
        </div>}
        description={list}
      ></Card.Meta>
    </StyledCard>
  </IconContext.Provider>
}

SubscriptionCard.propTypes = {
  title: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  price: PropTypes.object.isRequired,
  period: PropTypes.string.isRequired,
};

SubscriptionCard.defaultProps = {
};
