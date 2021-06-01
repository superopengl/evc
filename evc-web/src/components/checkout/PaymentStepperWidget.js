import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Divider, Card } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Space } from 'antd';
import { CreditCardFilled, ExclamationCircleOutlined, QuestionCircleFilled } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullCreditPayButton from './FullCreditPayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import { CardIcon } from 'components/CardIcon';
import VisaIcon from 'payment-icons/min/flat/visa.svg';
import MasterIcon from 'payment-icons/min/flat/mastercard.svg';
import MaestroIcon from 'payment-icons/min/flat/maestro.svg';
import AmexIcon from 'payment-icons/min/flat/amex.svg';
import JcbIcon from 'payment-icons/min/flat/jcb.svg';
import { notify } from 'util/notify';
import { from } from 'rxjs';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import styled from 'styled-components';
import StripeAlipayPaymentWidget from './StripeAlipayPaymentWidget';

const { Title, Text, Paragraph, Link: TextLink } = Typography;

const CardButton = styled(Button)`
    border-color: #55B0D4;
    background-color: #55B0D4;

  &:hover {
    border-color: #55B0D4;
    background-color: rgba(85,176,212,0.7);
  }

  &:focus {
    border-color: #55B0D4;
    background-color: rgba(85,176,212,0.7);
  }
`;

const PaymentStepperWidget = (props) => {

  const { planType, onComplete, onLoading, discount } = props;
  const [loading, setLoading] = React.useState(false);
  const [paymentDetail, setPaymentDetail] = React.useState();
  const [currentStep, setCurrentStep] = React.useState(0);
  const context = React.useContext(GlobalContext);
  const intl = useIntl();


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
        <Space style={{ alignItems: 'flex-start' }} size="middle">
          <Text type="danger" style={{ fontSize: 28, color: '#55B0D4' }}><ExclamationCircleOutlined /></Text>
          <div>
          <Paragraph type="secondary">
            <FormattedMessage id="text.noRefundAlert" />
          </Paragraph>
          <TextLink href="/chinese_user_payment_guide" target="_blank">中国用户支付指南 <QuestionCircleFilled /></TextLink>
          </div>
        </Space>
        <CardButton type="primary"
          block
          size="large"
          onClick={() => handleStepChange(1)}>
          <div style={{ fontWeight: 700, fontStyle: 'italic' }}>
            <CreditCardFilled style={{ marginRight: 6 }} /> <FormattedMessage id="text.payByCard" />
          </div>
        </CardButton>
        <PayPalCheckoutButton
          onProvision={() => handleProvisionSubscription('paypal')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
        {/* <AlipayButton
          disabled={loading}
          onClick={() => handleStepChange(3)}
        >
          Alipay
        </AlipayButton> */}
        <Button type="primary"
          block
          size="large"
          disabled={paymentDetail?.creditBalance < paymentDetail?.price}
          style={{ position: 'relative', top: -4 }}
          onClick={() => handleStepChange(2)}>
          <div style={{ fontWeight: 700, fontStyle: 'italic' }}>
            <Text type={paymentDetail?.creditBalance < paymentDetail?.price ? 'secondary' : null}>
              {/* <Icon component={() => <GiReceiveMoney />} style={{marginRight: 6 }}/> */}
              <FormattedMessage id={paymentDetail?.creditBalance < paymentDetail?.price ? 'text.noEnoughCredit' : 'text.payByCredit'} />
            </Text>
          </div>
        </Button>
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
          <MoneyAmount value={paymentDetail?.creditBalance} />
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
    },
    {
      // Alipay
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          type="info"
          showIcon
          description="You have to accept our CNY price when using Alipay."
        />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount (CNY):</Text>
          <MoneyAmount strong value={paymentDetail?.priceCny} symbol="¥"/>
        </Space>
        <Divider></Divider>
        <StripeAlipayPaymentWidget
          onProvision={() => handleProvisionSubscription('alipay')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
      </Space>
    },
  ];

  return (
    <Loading loading={loading} message={'In progress. Please do not close the window.'}>
      <Space direction="vertical" size="large" style={{ width: '100%', paddingBottom: 20 }} >
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text strong type="success" style={{ fontSize: 24, whiteSpace: 'nowrap' }}>
                <big>$ {(newPlanDef.price * (1 - discount)).toFixed(2)}</big>
              </Text>
              <small><Text type="secondary">{newPlanDef.unit}</Text></small>
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
  discount: PropTypes.number
};

PaymentStepperWidget.defaultProps = {
  discount: 0
};

export default withRouter(PaymentStepperWidget);
