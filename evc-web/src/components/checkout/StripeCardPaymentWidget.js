import React from 'react';
import { Space, Button, Typography } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { confirmSubscriptionPayment } from 'services/subscriptionService';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_EVC_STRIPE_PUBLISHABLE_KEY);

const { Title, Text, Paragraph } = Typography;

const StripeCardPaymentForm = (props) => {

  const { onProvision, onCommit } = props;
  const [loading, setLoading] = React.useState(false);
  const [inputComplete, setInputComplete] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !inputComplete) {
      return;
    }

    try {
      setLoading(true);
      const cardElement = elements.getElement('card');

      const paymentInfo = await onProvision();
      const { clientSecret, paymentId } = paymentInfo;

      // Use your card Element with other Stripe.js APIs
      const rawResponse = await stripe.confirmCardSetup(clientSecret,
        {
          payment_method: {
            card: cardElement,
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

  const handleCardInfoChange = (element) => {
    setInputComplete(element.complete)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* <Text>Please input card information</Text> */}
        <CardElement
          onChange={handleCardInfoChange}
          options={{
            hidePostalCode: true,
            style: {
              base: {
                fontSize: '16px',
                // color: '#424770',
                '::placeholder': {
                  color: 'rgba(0,0,0,0.2)',
                },
              },
              invalid: {
                color: '#d7183f',
              },
            },
          }}
        />
        <Button type="primary" htmlType="submit" block disabled={loading || !stripe || !inputComplete} loading={loading}>
          Pay by Card
        </Button>
      </Space>
    </form>
  )
}

const StripeCardPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeCardPaymentForm onProvision={props.onProvision} onCommit={props.onCommit} />
</Elements>)


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
};

StripeCardPaymentWidget.defaultProps = {
};

export default StripeCardPaymentWidget;
