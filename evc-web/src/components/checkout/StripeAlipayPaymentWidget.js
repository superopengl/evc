import React from 'react';
import { Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import * as _ from 'lodash';
import { useStripe, Elements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import { AlipayCircleOutlined } from '@ant-design/icons';
import { stripePromise } from 'services/stripeService';



const AlipayButton = styled(Button)`
  border-color: #108fe9;
  background-color: #108fe9;
  color: white;

  &:active, &:focus, &:hover {
    color:  #108fe9;
    background: white;
    border-color:  #108fe9;
  }
`;

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

      const succeededReturnUrl = `${process.env.REACT_APP_EVC_API_ENDPOINT}/subscription/payment/${paymentId}/confirm`;


      const rawResponse = await stripe.confirmAlipayPayment(clientSecret, {
        return_url: succeededReturnUrl
      });

      const { error } = rawResponse;

      debugger;
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
      size="large"
      icon={<AlipayCircleOutlined />}
      block
      disabled={loading || !isInfoComplete}
      style={{ fontWeight: 800, fontStyle: 'italic' }}
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
