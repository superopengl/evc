import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Checkbox, Switch, Divider } from 'antd';
import { signUp } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/PayPalCheckoutButton';
import { Alert, Modal, Space } from 'antd';
import StepWizard from 'react-step-wizard';
import { DoubleRightOutlined, RightOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import { StockSearchInput } from './StockSearchInput';
import * as _ from 'lodash';
import MoneyAmount from './MoneyAmount';
import { StripeCheckout } from './StripeCheckout';
import { Row, Col } from 'antd';
import { calculatePaymentDetail, commitSubscription, provisionSubscription } from 'services/subscriptionService';
import { Loading } from './Loading';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';

const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
`;



const PaymentButtonWidget = (props) => {

  const { visible, newPlan, recurring: propRecurring, paymentDetail, onProvision, onCommit, onOk } = props;
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);
  const [recurring, setRecurring] = React.useState(propRecurring);
  const [detail, setDetail] = React.useState(paymentDetail);
  const [willUseBalance, setWillUseBalance] = React.useState(true);
  const wizardRef = React.useRef(null);
  const needsSelectSymbols = newPlan === 'selected_monthly';

  React.useEffect(() => {
    setDetail(paymentDetail);
    setRecurring(propRecurring);
  }, [paymentDetail, propRecurring]);

  const handleFullBalancePay = async () => {
    const subscription = await onProvision();
    const {id} = subscription;
    await onCommit(id, 0, null, null);
    onOk();
  }

  if(!detail) {
    return <Loading loading={true}/>
  }

  if (detail.additionalPay === 0) {
    return <Button type="primary" block onClick={handleFullBalancePay}>Purchase without paying</Button>
  }


  return (
    <>
      {detail.additionalPay === 0 ? <></> :
        <>
          <PayPalCheckoutButton payPalPlanId={''} />
          <StripeCheckout />
          <StripeCardPaymentWidget />
        </>
      }
    </>
  );
}

PaymentButtonWidget.propTypes = {
  paymentDetail: PropTypes.shape({
    additionalPay: PropTypes.number,
    balanceDeductAmount: PropTypes.number,
    paymentMethod: PropTypes.string,
    price: PropTypes.number,
    totalBalanceAmount: PropTypes.number,
  }),
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  disabled: PropTypes.bool,
};

PaymentButtonWidget.defaultProps = {
  disabled: false,
};

export default withRouter(PaymentButtonWidget);
