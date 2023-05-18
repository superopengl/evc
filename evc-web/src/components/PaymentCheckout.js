import React from "react";
import ReactDOM from "react-dom";
import scriptLoader from "react-async-script-loader";
import { Loading } from "./Loading";
import { PayPalButton } from "react-paypal-button-v2";
import PropTypes from 'prop-types';

//create button here
// next create the class and Bind React and ReactDom to window
//as we will be needing them later

const PAYPAL_CLIENT_ID = 'sb' || process.env.REACT_APP_EVC_PAYPAL_CLIENT_ID

export const PaymentCheckout = (props) => {

  const CURRENCY = 'USD';
  const { price, onSuccess, onApprove } = props;

  const [amount, setAmount] = React.useState(price);

  const handleTransactionSuccess = async (details, data) => {
    debugger;
    onSuccess(details, data);
    // alert("Transaction completed by " + details.payer.name.given_name);

    // // OPTIONAL: Call your server to save the transaction
    // return fetch("/paypal-transaction-complete", {
    //   method: "post",
    //   body: JSON.stringify({
    //     orderID: data.orderID
    //   })
    // });
  }

  const handleCreateOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          currency_code: CURRENCY,
          value: amount
        }
      }],
      // application_context: {
      //   shipping_preference: "NO_SHIPPING" // default is "GET_FROM_FILE"
      // }
    });
  }

  const handleApprove = (data, actions) => {
    // Capture the funds from the transaction
    return actions.order.capture().then(function (details) {
      onApprove(details);
      // Show a success message to your buyer
      // alert("Transaction completed by " + details.payer.name.given_name);

      // // OPTIONAL: Call your server to save the transaction
      // return fetch("/paypal-transaction-complete", {
      //   method: "post",
      //   body: JSON.stringify({
      //     orderID: data.orderID
      //   })
      // });
    });
  }
  return (
    <PayPalButton
      amount={amount}
      createOrder={handleCreateOrder}
      onSuccess={handleTransactionSuccess}
      onApprove={handleApprove}
      style={{
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 40
      }}
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: CURRENCY
      }}
    // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
    />

  )
}

PaymentCheckout.propTypes = {
  price: PropTypes.number.isRequired,
  onSuccess: PropTypes.func,
  onApprove: PropTypes.func
};

PaymentCheckout.defaultProps = {};