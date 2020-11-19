import React from "react";
import ReactDOM from "react-dom";
import scriptLoader from "react-async-script-loader";
import { Loading } from "./Loading";
import { PayPalButton } from "react-paypal-button-v2";
import PropTypes from 'prop-types';
import {loadStripe} from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Typography, Button, Form, Input, Checkbox, Switch, Divider } from 'antd';

//create button here
// next create the class and Bind React and ReactDom to window
//as we will be needing them later

const PAYPAL_CLIENT_ID = process.env.REACT_APP_EVC_PAYPAL_CLIENT_ID

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay
      </button>
    </form>
  );
};

export const StripeCheckout = (props) => {

  const stripePromise = loadStripe('pk_test_51Hp56jEBt7ChgqJqBRoTJ8V2IPcwYDAMdJhp9XbNTPDHoyOhpOt3HBPIv8iV39mHoUMUQ9NN7gKxZIVDVzJhGWWx00MK1EEkKD');

  return (
    <Elements stripe={stripePromise}>
    <CheckoutForm />
    </Elements>

  )
}

StripeCheckout.propTypes = {
  onSuccess: PropTypes.func,
  onApprove: PropTypes.func
};

StripeCheckout.defaultProps = {};