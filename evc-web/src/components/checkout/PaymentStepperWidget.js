import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider, Steps, Card, Image } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Space } from 'antd';
import Icon, { LeftOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullCreditPayButton from './FullCreditPayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import { FaCashRegister } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { CardIcon } from 'components/CardIcon';
import VisaIcon from 'payment-icons/min/flat/visa.svg';
import MasterIcon from 'payment-icons/min/flat/mastercard.svg';
import MaestroIcon from 'payment-icons/min/flat/maestro.svg';
import AmexIcon from 'payment-icons/min/flat/amex.svg';
import JcbIcon from 'payment-icons/min/flat/jcb.svg';
import PayPalIcon from 'payment-icons/min/flat/paypal.svg';
import { notify } from 'util/notify';
import { from } from 'rxjs';

const { Title, Text } = Typography;

const PaymentStepperWidget = (props) => {

  const { planType, onComplete, onLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [recurring, setRecurring] = React.useState(true);
  const [paymentDetail, setPaymentDetail] = React.useState();
  const [willUseCredit, setWillUseCredit] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const context = React.useContext(GlobalContext);


  const fetchPaymentDetail = async (useCredit) => {
    try {
      setLoading(true)
      const detail = await calculatePaymentDetail(planType, useCredit);
      ReactDOM.unstable_batchedUpdates(() => {
        setPaymentDetail(detail);
        setLoading(false)
      });
    } catch {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);


  React.useEffect(() => {
    let load$;
    if (planType) {
      load$?.unsubscribe();
      load$ = from(fetchPaymentDetail(willUseCredit)).subscribe();
    }
    return () => {
      load$?.unsubscribe();
    }
  }, [planType]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);

  const handleUseCreditChange = checked => {
    fetchPaymentDetail(checked);
    setWillUseCredit(checked);
  }

  const handleRecurringChange = checked => {
    setRecurring(checked);
  }

  const isValidPlan = !!paymentDetail;

  const handleProvisionSubscription = async (method) => {
    const provisionData = await provisionSubscription({
      plan: planType,
      recurring: recurring,
      preferToUseCredit: willUseCredit,
      method
    });
    return provisionData;
  }

  const handleSuccessfulPayment = async (paymentId, payload) => {
    try {
      setLoading(true);
      await confirmSubscriptionPayment(paymentId, payload);
      // Needs to refresh auth user because the role may have changed based on subscription change.
      context.setUser(await getAuthUser());
    } finally {
      setLoading(false);
    }
    onComplete();
    notify.success('Successfully added subscription', 'Thank you very much for purchasing the subscription.');
  }

  // const handleCommitSubscription = async (data) => {
  //   await commitSubscription(subscriptionId, {
  //     paidAmount: paidAmount,
  //     paymentMethod: paymentDetail.paymentMethod,
  //     rawRequest: req,
  //     rawResponse: resp
  //   });
  // }

  const handleStepChange = current => {
    setCurrentStep(current);
  }

  const shouldShowFullCreditButton = isValidPlan && !recurring && willUseCredit && paymentDetail.additionalPay === 0;
  const shouldShowCard = isValidPlan && (paymentDetail.additionalPay > 0 || recurring);
  const shouldShowPayPal = isValidPlan && !recurring && paymentDetail.additionalPay > 0;
  const showCreditCardCombinedRecurringMessage = recurring && willUseCredit;

  const stepDef = [
    {
      component: <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Auto renew (payments happen on expiray automatically)?</Text>
          <Switch defaultChecked={recurring} onChange={handleRecurringChange} />
        </Space>
        {paymentDetail?.totalCreditAmount > 0 && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Prefer to use credit?</Text>
          <Switch defaultChecked={false} onChange={handleUseCreditChange} />
        </Space>}
        {willUseCredit && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Total credit:</Text>
          {paymentDetail ? <MoneyAmount value={paymentDetail.totalCreditAmount} /> : '-'}
        </Space>}
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Total amount:</Text>
          {paymentDetail ? <MoneyAmount value={paymentDetail.price} /> : '-'}
        </Space>
        {willUseCredit && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Credit deduction:</Text>
          {paymentDetail ? <MoneyAmount value={paymentDetail.creditDeductAmount * -1} /> : '-'}
        </Space>}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
        </Space>
        <Divider />
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Space>
            {shouldShowCard && [VisaIcon, MasterIcon, MaestroIcon, AmexIcon, JcbIcon].map((s, i) => <CardIcon key={i} src={s} />)}
            {shouldShowPayPal && <CardIcon src={PayPalIcon} />}
          </Space>
        </div>
        {shouldShowFullCreditButton ? <>
          <Alert type="info" description="Congratulations! You have enough credit balance to purchase this plan without any additional pay." showIcon style={{ marginBottom: 20 }} />
          <FullCreditPayButton
            onProvision={() => handleProvisionSubscription('credit')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />
        </> :
          <Button type="primary" block
            size="large"
            style={{ marginTop: 20 }} disabled={!isValidPlan} onClick={() => handleStepChange(1)}>Checkout</Button>
        }
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
        </Space>
        <Divider><Text type="secondary"><small>Payment method</small></Text></Divider>
        {/* {shouldShowFullCreditButton && <>
          <Alert type="info" description="Congratulations! You have enough credit balance to purchase this plan without any additional pay." showIcon />
          <FullCreditPayButton
            onProvision={() => handleProvisionSubscription('credit')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />
        </>} */}
        {showCreditCardCombinedRecurringMessage && <Alert
          type="info" description="Credit card information is required when opt-in auto renew. When each renew payment happens, system will try to use your credit as much over charging your card." showIcon />}
        {shouldShowCard && <StripeCardPaymentWidget
          onProvision={() => handleProvisionSubscription('card')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />}
        {/* {shouldShowAliPay && <StripeAlipayPaymentWidget
          onProvision={() => handleProvisionSubscription('alipay')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />} */}
        {shouldShowPayPal && <PayPalCheckoutButton
          onProvision={() => handleProvisionSubscription('paypal')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />}
        <Divider />
        <Button size="large" block icon={<LeftOutlined />} onClick={() => handleStepChange(0)}>Back to Options</Button>
      </Space>
    }
  ];

  return (
    <Loading loading={loading} message={'In progress. Please do not close the window.'}>
      <Space direction="vertical" size="large" style={{ width: '100%', paddingBottom: 20 }} >
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div><Text strong type="success"><big>$ {newPlanDef.price}</big></Text> {newPlanDef.unit}</div>
          </Space>
          <div style={{ display: 'flex' }}>
            {newPlanDef.description}
          </div>

        </Card>
        <Steps current={currentStep} onChange={handleStepChange} style={{ margin: '40px 0 0' }}>
          <Steps.Step title="Options" icon={<Icon component={() => <BsCardChecklist />} />} />
          <Steps.Step title="Checkout" icon={<Icon component={() => <FaCashRegister />} />} />
        </Steps>
        <div style={{ width: '100%' }}>
          {stepDef[currentStep].component}
        </div>
      </Space>
    </Loading>
  )
}

PaymentStepperWidget.propTypes = {
  planType: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

PaymentStepperWidget.defaultProps = {
};

export default withRouter(PaymentStepperWidget);
