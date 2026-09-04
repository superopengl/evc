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
padding: 8px 8px 16px;
text-align: center;
height: 100%;
position: relative;
width: 100%;
max-width: 400px;
border: 1px solid var(--evc-line);
border-radius: 14px;
transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

& .ant-card-head {
  color: var(--evc-text);
  border-bottom: none;
}

& .ant-card-head-title {
  font-family: var(--evc-font-mono);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--evc-text-faint);
}

&.subscription-active {
border: 1px solid var(--evc-signal);
background-color: var(--evc-signal-wash);
}

/* The hover used to be a 1.05 scale, which nudged the neighbouring cards on
   every pointer pass and blurred the card's own text mid-transition. A 2px
   lift plus a shadow reads the same and only repaints the one card. */
&.interactive:hover {
border-color: var(--evc-signal);
box-shadow: 0 14px 34px rgba(16, 34, 44, 0.1);
transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  transition: none;

  &.interactive:hover {
    transform: none;
  }
}
`;

export const SubscriptionCard = props => {
  const { onClick, title, description, recurring, price, discount = 0, unit, active = false, interactive = true } = props;

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
            <MoneyAmount className="evc-mono" style={{ fontSize: '2.4rem', margin: '0 4px', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--evc-text)' }} value={price * (1 - discount)} />
            {shouldApplyDiscount && <div>
              <Text type="danger" style={{marginRight: 6}}><s><i>was <MoneyAmount type="danger" style={{ fontWeight: 500 }} value={price} /></i></s></Text>
            </div>}
          </div>
          <Text style={{ fontSize: 12.5, letterSpacing: '0.02em' }} type="secondary">{unit}</Text>
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

