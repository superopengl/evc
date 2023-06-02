import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { loadStripe } from '@stripe/stripe-js';
import { fetchStripeCheckoutSession } from 'services/subscriptionService';



const stripePromise = loadStripe(process.env.REACT_APP_EVC_STRIPE_PUBLISHABLE_KEY);

const StripeCardPaymentWidget = (props) => {

  const [loading, setLoading] = React.useState(false);


  const handleFullBalancePay = async () => {
    try {
      setLoading(true);
      const sessionId = await fetchStripeCheckoutSession();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });
      if (error) {
        notify.error('Payment failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return <Button type="primary" block onClick={handleFullBalancePay} disabled={loading}>Pay by Card</Button>
}

StripeCardPaymentWidget.propTypes = {
};

StripeCardPaymentWidget.defaultProps = {
};

export default withRouter(StripeCardPaymentWidget);
