import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { commitSubscription, fetchStripeCheckoutSession, confirmSubscriptionPayment } from 'services/subscriptionService';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';

const StripeCardPaymentWidget = (props) => {

  const { onProvision, onOk } = props;
  const [loading, setLoading] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
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

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <Button type="primary" htmlType="submit" block disabled={loading || !stripe}>Pay by Card</Button>
    </form>
  )
}


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func,
  onOk: PropTypes.func
};

StripeCardPaymentWidget.defaultProps = {
};

export default withRouter(StripeCardPaymentWidget);
