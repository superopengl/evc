import React from 'react';
import { Space, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { stripePromise } from 'services/stripeService';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

const CardButton = styled(Button)`
    border-color: #55B0D4;
    background-color: #55B0D4;

  &:hover {
    border-color: #55B0D4;
    background-color: rgba(85,176,212,0.7);
  }

  &:focus {
    border-color: #55B0D4;
    background-color: rgba(85,176,212,0.7);
  }
`;

const StripeCardPaymentForm = (props) => {

  const { onProvision, onCommit, onLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [cardNumberComplete, setCardNumberComplete] = React.useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = React.useState(false);
  const [cardCvcComplete, setCardCvcComplete] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  const isInfoComplete = stripe && elements && cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isInfoComplete) {
      return;
    }

    try {
      setLoading(true);
      const cardNumberElement = elements.getElement('cardNumber');

      const paymentInfo = await onProvision();
      const { clientSecret, paymentId } = paymentInfo;

      // Use your card Element with other Stripe.js APIs
      const rawResponse = await stripe.confirmCardSetup(clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
          }
        });

      const { error } = rawResponse;

      if (error) {
        notify.error('Failed to complete the payment', error.message);
      } else {
        await onCommit(paymentId, {
          stripePaymentMethodId: rawResponse.setupIntent.payment_method
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (element) => {
    setCardNumberComplete(element.complete)
  }

  const handleCardExpiryChange = (element) => {
    setCardExpiryComplete(element.complete)
  }

  const handleCardCvcChange = (element) => {
    setCardCvcComplete(element.complete)
  }

  const options = {
    style: {
      base: {
        fontSize: '16px',
        // color: '#55B0D4',
        textAlign: 'center',
        '::placeholder': {
          color: 'rgba(0,0,0,0.2)',
        },
      },
      invalid: {
        color: '#d7183f',
      },
    },
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* <Text>Please input card information</Text> */}
      {/* <label>Card Number <CardNumberElement /></label> */}
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <div style={{ width: 270 }}>
          <CardNumberElement
            onChange={handleCardNumberChange}
            options={{
              ...options,
              placeholder: '1234 1234 1234 1234'
            }}
          />
        </div>
        <div style={{ width: 90 }}>
          <CardExpiryElement
            onChange={handleCardExpiryChange}
            options={{
              ...options,
              placeholder: 'MM / YY'
            }}
          />
        </div>
        <div style={{ width: 90 }}>
          <CardCvcElement
            onChange={handleCardCvcChange}
            options={{
              ...options,
              placeholder: 'CVC'
            }}
          />
        </div>
      </Space>
      <CardButton type="primary" size="large" htmlType="submit"
        style={{ marginTop: 10 }}
        // icon={<CreditCardOutlined />}
        block
        disabled={loading || !isInfoComplete} loading={loading} >
        <div style={{ fontWeight: 800, fontStyle: 'italic' }}>
          <FormattedMessage id="text.payByCard" />
        </div>
      </CardButton>

    </form>
  )
}

const StripeCardPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeCardPaymentForm onProvision={props.onProvision} onCommit={props.onCommit} onLoading={props.onLoading} />
</Elements>)


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

StripeCardPaymentWidget.defaultProps = {
};

export default StripeCardPaymentWidget;
