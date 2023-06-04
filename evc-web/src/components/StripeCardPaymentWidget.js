import React from 'react';
import { withRouter } from 'react-router-dom';
import { Space, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { confirmSubscriptionPayment } from 'services/subscriptionService';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCardPaymentWidget = (props) => {

  const { onProvision, onOk } = props;
  const [loading] = React.useState(false);
  const [inputComplete, setInputComplete] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !inputComplete) {
      return;
    }

    const cardElement = elements.getElement('card');

    const paymentInfo = await onProvision();
    const { clientSecret, paymentId } = paymentInfo;

    // Use your card Element with other Stripe.js APIs
    const rawResponse = await stripe.confirmCardPayment(clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
        setup_future_usage: 'off_session'
      });

    const { error } = rawResponse;

    if (error) {
      notify.error('Failed to complete the payment', error.message);
    } else {
      await confirmSubscriptionPayment(paymentId, { rawResponse });
      onOk();
    }

  };

  const handleCardInfoChange = (element) => {
    setInputComplete(element.complete)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">

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
        <Button type="primary" htmlType="submit" block disabled={loading || !stripe || !inputComplete}>Pay by Card</Button>
      </Space>
    </form>
  )
}


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onOk: PropTypes.func
};

StripeCardPaymentWidget.defaultProps = {
  onOk: () => { }
};

export default withRouter(StripeCardPaymentWidget);
