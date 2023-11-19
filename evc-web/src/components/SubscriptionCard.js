import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Card, Space, Tooltip,Tag } from 'antd';
import styled from 'styled-components';
import { IconContext } from "react-icons";
import MoneyAmount from './MoneyAmount';
import { Divider } from 'antd';
import { FormattedMessage } from 'react-intl';
import { QuestionCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

const StyledCard = styled(Card)`
padding: 10px;
text-align: center;
height: 100%;
& .ant-card-head {
  color: #333333;
}
position: relative;
width: 100%;
max-width: 400px;

&.subscription-active {
// box-shadow: 0 5px 3px rgba(255,197,61,0.8);
border: 2px solid #57BB60;
background-color: rgba(87,187,96, 0.1);
// transform: scale(1.02);
}

&.interactive:hover {
// background-color: #ffe7ba;
border: 2px solid #57BB60;
transform: scale(1.05);
}
`;

export const SubscriptionCard = props => {
  const { onClick, title, description, recurring, price, discount, unit, active, interactive } = props;

  const classNameArray = [];
  if (active) {
    classNameArray.push('subscription-active');
  }
  if (interactive) {
    classNameArray.push('interactive');
  }

  const shouldApplyDiscount = discount > 0 && price > 0;

  return <IconContext.Provider value={{ size: '3rem' }}>
    <StyledCard
      className={classNameArray.join(' ')}
      title={<>
        {/* {icon} */}
        <div style={{ textTransform: 'uppercase', fontSize: 14 }}>{title}</div>
      </>}
      hoverable={interactive}
      onClick={onClick}
      size="large"
      bodyStyle={{paddingTop: shouldApplyDiscount ? 0 : 24}}
    // bodyStyle={{backgroundColor: bgColor}}
    // headerStyle={{backgroundColor: bgColor}}
    >
      {active && <Text strong type="success" style={{ position: 'absolute', right: 8, bottom: 4 }}>Current plan{recurring && ' (auto renew)'}</Text>}
      {shouldApplyDiscount && <Tag color="#d7183f"><i><strong>Initial purchase discount</strong></i></Tag>}
      <Card.Meta
        title={<div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* <Text style={{ fontSize: '2.2rem', margin: '0 4px', color: '#57BB60' }}><sup><small>$</small></sup> {price}</Text> */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'space-evenly', marginBottom: shouldApplyDiscount ? 0 : 22 }} size="small">
            <MoneyAmount style={{ fontSize: '2.2rem', margin: '0 4px', fontWeight: 500 }} value={price * (1 - discount)} />
            {shouldApplyDiscount && <div>
              <Text type="danger" style={{marginRight: 6}}><s><i>was <MoneyAmount type="danger" style={{ fontWeight: 500 }} value={price} /></i></s></Text>
            </div>}
          </div>
          <Text style={{ fontSize: 14 }} type="secondary">{unit}</Text>
          <Divider />
        </div>}
        description={description}
      ></Card.Meta>
    </StyledCard>
  </IconContext.Provider>
}

SubscriptionCard.propTypes = {
  title: PropTypes.any.isRequired,
  description: PropTypes.any,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number,
  unit: PropTypes.any.isRequired,
  active: PropTypes.bool,
  recurring: PropTypes.bool,
  interactive: PropTypes.bool,
};

SubscriptionCard.defaultProps = {
  active: false,
  interactive: true,
  discount: 0,
};
