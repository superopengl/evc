import React from 'react';
import { withRouter } from 'react-router-dom';
import { Space, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { confirmCardPayment } from 'services/subscriptionService';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripeCardPaymentWidget = (props) => {

  const { onProvision, onOk } = props;
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
        const paymentMethodId = rawResponse.setupIntent.payment_method;
        await confirmCardPayment(paymentId, { rawResponse, paymentMethodId });
        onOk();
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


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onOk: PropTypes.func
};

StripeCardPaymentWidget.defaultProps = {
  onOk: () => { }
};

export default withRouter(StripeCardPaymentWidget);
