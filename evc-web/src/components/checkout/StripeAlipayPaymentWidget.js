import React from 'react';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { useStripe, Elements } from '@stripe/react-stripe-js';
import { stripePromise } from 'services/stripeService';
import { AlipayButton } from 'components/AlipayButton';

function getReturnFullUrl(paymentId) {
  let path = `${process.env.REACT_APP_EVC_API_ENDPOINT}/subscription/payment/${paymentId}/confirm`;
  const isAbsoluteUrl = /https?:\/\//.test(path);
  if (isAbsoluteUrl) {
    return path;
  }

  path = `${window.location.origin}${path}`;
  return path;
}

const StripeAlipayPaymentForm = (props) => {

  const { onProvision, onCommit, onLoading } = props;

  const [loading, setLoading] = React.useState(false);
  const stripe = useStripe();

  const isInfoComplete = stripe;

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const paymentInfo = await onProvision();
      const { clientSecret, paymentId } = paymentInfo;

      const succeededReturnUrl = getReturnFullUrl(paymentId);


      const rawResponse = await stripe.confirmAlipayPayment(clientSecret, {
        return_url: succeededReturnUrl
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

  return (
    <AlipayButton
      disabled={loading || !isInfoComplete}
      onClick={handleSubmit}
    >
      Alipay
    </AlipayButton>
  )
}

const StripeAlipayPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeAlipayPaymentForm onProvision={props.onProvision} onCommit={props.onCommit} onLoading={props.onLoading} />
</Elements>)


StripeAlipayPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

StripeAlipayPaymentWidget.defaultProps = {
};

export default StripeAlipayPaymentWidget;
