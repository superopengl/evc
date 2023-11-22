import React from "react";
import { Loading } from "../Loading";
import { PayPalButton } from "react-paypal-button-v2";
import PropTypes from 'prop-types';
import { notify } from "util/notify";

//create button here
// next create the class and Bind React and ReactDom to window
//as we will be needing them later

const PAYPAL_CLIENT_ID = process.env.REACT_APP_EVC_PAYPAL_CLIENT_ID

export const PayPalCheckoutButton = (props) => {

  const CURRENCY_USD = 'USD';
  const { onProvision, onCommit, onLoading } = props;
  const [loading, setLoading] = React.useState(true);
  const [paymentId, setPaymentId] = React.useState();

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  const handleTransactionSuccess = async (details, data) => {
    await onCommit(paymentId, details);
  }

  const handleCreateOrder = async (data, actions) => {
    const payment = await onProvision();
    const { paymentId, amount} = payment;
    setPaymentId(paymentId);

    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: CURRENCY_USD,
          value: amount
        }
      }],
      application_context: {
        shipping_preference: "NO_SHIPPING" // default is "GET_FROM_FILE"
      }
    });
  }

  const handleCheckoutError = err => {
    notify.error('Error in PayPay checkout', err.message);
  }

  const handleCatchError = err => {
    notify.error('Error in PayPay checkout', err.message);
  }

  const handleShippingChange = async (data,actions) => {
    /**
     * Workaround for PERMISSION_DENIED error
     * See https://github.com/paypal/paypal-checkout-components/issues/1521
     */
    return actions.resolve();
  }

  return (<Loading loading={loading} style={{ minWidth: 240, height: 80,  width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
    <PayPalButton
      // amount={amount}
      // currency={CURRENCY_USD}
      createOrder={handleCreateOrder}
      catchError={handleCatchError}
      onError={handleCheckoutError}
      onSuccess={handleTransactionSuccess}
      onButtonReady={() => setLoading(false)}
      onShippingChange={handleShippingChange}
      // createSubscription={handleCreateSubscription}
      // onApprove={handleApprove}
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 40
      }}
      
      options={{
        vault: true,
        clientId: PAYPAL_CLIENT_ID,
        disableFunding: 'card',
        locale: 'en_US',
        // currency: CURRENCY,
        // intent: 'subscription'
      }}
    // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
    />
  </Loading>
  )
}

PayPalCheckoutButton.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  onApprove: PropTypes.func,
};

PayPalCheckoutButton.defaultProps = {};