import React from "react";
import { Loading } from "../Loading";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import PropTypes from 'prop-types';
import { notify } from "util/notify";

const PAYPAL_CLIENT_ID = process.env.REACT_APP_EVC_PAYPAL_CLIENT_ID;
const CURRENCY_USD = 'USD';

const BUTTON_STYLE = {
  layout: 'vertical',
  color: 'gold',
  shape: 'rect',
  label: 'paypal',
  height: 40,
};

/**
 * react-paypal-button-v2 (last published 2021, capped at React 17) bundled the script loader and
 * the buttons in one component. @paypal/react-paypal-js splits them, so the loading state that
 * used to arrive via `onButtonReady` now comes from the script reducer.
 */
const Buttons = ({ onProvision, onCommit, onLoading, setPaymentId, paymentIdRef }) => {
  const [{ isPending }] = usePayPalScriptReducer();

  React.useEffect(() => {
    onLoading(isPending);
  }, [isPending, onLoading]);

  const handleCreateOrder = async (data, actions) => {
    const payment = await onProvision();
    const { paymentId, amount } = payment;
    setPaymentId(paymentId);
    paymentIdRef.current = paymentId;

    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: CURRENCY_USD,
          value: amount,
        },
      }],
      application_context: {
        shipping_preference: "NO_SHIPPING", // default is "GET_FROM_FILE"
      },
    });
  };

  // v2 captured the order internally and handed the result to onSuccess; here we capture.
  const handleApprove = async (data, actions) => {
    const details = await actions.order.capture();
    await onCommit(paymentIdRef.current, details);
  };

  const handleError = err => {
    notify.error('Error in PayPal checkout', err?.message);
  };

  /**
   * Workaround for PERMISSION_DENIED error
   * See https://github.com/paypal/paypal-checkout-components/issues/1521
   */
  const handleShippingChange = async (data, actions) => actions.resolve();

  return <PayPalButtons
    style={BUTTON_STYLE}
    createOrder={handleCreateOrder}
    onApprove={handleApprove}
    onError={handleError}
    onShippingChange={handleShippingChange}
  />;
};

export const PayPalCheckoutButton = (props) => {
  const { onProvision, onCommit, onLoading } = props;
  const [loading, setLoading] = React.useState(true);
  const [, setPaymentId] = React.useState();
  const paymentIdRef = React.useRef();

  const handleLoading = React.useCallback(pending => {
    setLoading(pending);
    onLoading(pending);
  }, [onLoading]);

  return (<Loading loading={loading} style={{ minWidth: 240, height: 80, width: '100%', marginLeft: 'auto', marginRight: 'auto' }}>
    <PayPalScriptProvider options={{
      clientId: PAYPAL_CLIENT_ID,
      vault: true,
      disableFunding: 'card',
      locale: 'en_US',
    }}>
      <Buttons
        onProvision={onProvision}
        onCommit={onCommit}
        onLoading={handleLoading}
        setPaymentId={setPaymentId}
        paymentIdRef={paymentIdRef}
      />
    </PayPalScriptProvider>
  </Loading>
  );
};

PayPalCheckoutButton.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};
