import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider, Steps, Card, Row, Col } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Space } from 'antd';
import Icon, { ExclamationCircleOutlined, WarningFilled, WarningOutlined } from '@ant-design/icons';
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
import { FormattedMessage } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

const PaymentStepperWidget = (props) => {

  const { planType, onComplete, onLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [paymentDetail, setPaymentDetail] = React.useState();
  const [currentStep, setCurrentStep] = React.useState(0);
  const context = React.useContext(GlobalContext);


  const fetchPaymentDetail = async () => {
    try {
      setLoading(true)
      const detail = await calculatePaymentDetail(planType);
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
      load$ = from(fetchPaymentDetail()).subscribe();
    }
    return () => {
      load$?.unsubscribe();
    }
  }, [planType]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);

  const handleProvisionSubscription = async (method) => {
    const provisionData = await provisionSubscription({
      plan: planType,
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

  const stepDef = [
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* <Space style={{ width: '100%', justifyContent: 'space-between' }}>
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
        </div> */}
        <Space style={{alignItems: 'flex-start'}} size="middle">
          <Text type="danger" style={{ fontSize: 28, color: '#55B0D4' }}><ExclamationCircleOutlined /></Text>
          <Paragraph type="secondary">
            <FormattedMessage id="text.noRefundAlert" />
          </Paragraph>
        </Space>
        <Row gutter={20}>
          <Col span={12}>
            <Button type="primary"
              block
              size="large"
              style={{ height: 100 }}
              onClick={() => handleStepChange(1)}>
              <FormattedMessage id="text.payNow" />
            </Button>
          </Col>
          <Col span={12}>
            <Button type="primary"
              block
              ghost
              size="large"
              style={{ height: 100 }}
              onClick={() => handleStepChange(2)}>
              <FormattedMessage id="text.payByCredit" />
            </Button>
          </Col>
        </Row>

      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          type="info"
          showIcon
          description="Auto renew payment is applied. You can cancel it later."
        />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          <MoneyAmount strong value={paymentDetail?.price} />
        </Space>
        <Divider></Divider>
        {/* {shouldShowFullCreditButton && <>
          <Alert type="info" description="Congratulations! You have enough credit balance to purchase this plan without any additional pay." showIcon />
          <FullCreditPayButton
            onProvision={() => handleProvisionSubscription('credit')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />
        </>} */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Space>
            {[VisaIcon, MasterIcon, MaestroIcon, AmexIcon, JcbIcon].map((s, i) => <CardIcon key={i} src={s} />)}
          </Space>
        </div>
        <StripeCardPaymentWidget
          onProvision={() => handleProvisionSubscription('card')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
        {/* {shouldShowAliPay && <StripeAlipayPaymentWidget
          onProvision={() => handleProvisionSubscription('alipay')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />} */}
        <Divider><Text type="secondary"><small>or</small></Text></Divider>
        <PayPalCheckoutButton
          onProvision={() => handleProvisionSubscription('paypal')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
        {/* <Divider />
        <Button size="large" block icon={<LeftOutlined />} onClick={() => handleStepChange(0)}>Back to Options</Button> */}
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          type="info"
          showIcon
          description="Congratulations! You have enough credit balance to purchase this plan without any additional pay."
        />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Current credit balance:</Text>
          <MoneyAmount value={paymentDetail?.totalCreditAmount} />
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Total amount:</Text>
          <MoneyAmount value={paymentDetail?.price} />
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Credit deduction:</Text>
          <MoneyAmount strong value={paymentDetail?.price * -1} />
        </Space>
        {/* <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={0} />
        </Space> */}
        <Divider></Divider>
        <FullCreditPayButton
          onProvision={() => handleProvisionSubscription('credit')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
      </Space>
    }
  ];

  return (
    <Loading loading={loading} message={'In progress. Please do not close the window.'}>
      <Space direction="vertical" size="large" style={{ width: '100%', paddingBottom: 20 }} >
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div>
              <Text strong type="success" style={{ fontSize: 24 }}>
                <big>$ {newPlanDef.price}</big>
              </Text> {newPlanDef.unit}
            </div>
          </Space>
          <div style={{ display: 'flex' }}>
            {newPlanDef.description}
          </div>

        </Card>
        {/* <Steps current={currentStep} onChange={handleStepChange} style={{ margin: '40px 0 0' }}>
          <Steps.Step title="Options" icon={<Icon component={() => <BsCardChecklist />} />} />
          <Steps.Step title="Checkout" icon={<Icon component={() => <FaCashRegister />} />} />
        </Steps> */}
        <div style={{ width: '100%', marginTop: 16 }}>
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
