import React from "react";
import ReactDOM from "react-dom";
import scriptLoader from "react-async-script-loader";
import { Loading } from "../Loading";
import { PayPalButton } from "react-paypal-button-v2";
import PropTypes from 'prop-types';

//create button here
// next create the class and Bind React and ReactDom to window
//as we will be needing them later

const PAYPAL_CLIENT_ID = process.env.REACT_APP_EVC_PAYPAL_CLIENT_ID


export const PayPalCheckoutButton = (props) => {

  const CURRENCY = 'USD';
  const { payPalPlanId, onSuccess, onApprove } = props;


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

  // const handleCreateOrder = (data, actions) => {
  //   return actions.order.create({
  //     purchase_units: [{
  //       amount: {
  //         currency_code: CURRENCY,
  //         value: amount
  //       }
  //     }],
  //     // application_context: {
  //     //   shipping_preference: "NO_SHIPPING" // default is "GET_FROM_FILE"
  //     // }
  //   });
  // }

  const handleApprove = (data, actions) => {
    // Capture the funds from the transaction
    return actions.subscription.get().then((details) => {
      debugger;
      onApprove(details);
    });
  }

  const handleCreateSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: payPalPlanId
    });
  }

  return (<div style={{minWidth: 240, width: '100%', marginLeft:'auto', marginRight: 'auto'}}>
    <PayPalButton
      // amount={amount}
      // createOrder={handleCreateOrder}
      // onSuccess={handleTransactionSuccess}
      createSubscription={handleCreateSubscription}
      onApprove={handleApprove}
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
        // currency: CURRENCY,
        intent: 'subscription'
      }}
    // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
    />
</div>
  )
}

PayPalCheckoutButton.propTypes = {
  payPalPlanId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onApprove: PropTypes.func
};

PayPalCheckoutButton.defaultProps = {};