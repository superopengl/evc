import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider, Steps, Card } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Modal, Space } from 'antd';
import Icon, { LeftOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import * as _ from 'lodash';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullCreditPayButton from './FullCreditPayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import { FaCashRegister } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import StripeAlipayPaymentWidget from './StripeAlipayPaymentWidget';

const { Title, Text } = Typography;

const PaymentModal = (props) => {

  const { visible, planType, onOk, onCancel } = props;
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);
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
    setModalVisible(visible);
  }, [visible]);

  React.useEffect(() => {
    if (planType) {
      fetchPaymentDetail(willUseCredit);
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
    onOk();
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
  const shouldShowAliPay = isValidPlan && !recurring && paymentDetail.additionalPay > 0;
  const showCreditCardCombinedRecurringMessage = recurring && willUseCredit;

  const stepDef = [
    {
      component: <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Auto renew (payments happen at the end of alive subscription automatically)?</Text>
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
        <Button type="primary" block style={{ marginTop: 20 }} disabled={!isValidPlan} onClick={() => handleStepChange(1)}>Checkout</Button>
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
        </Space>
        <Divider><Text type="secondary"><small>Payment method</small></Text></Divider>
        {shouldShowFullCreditButton && <>
          <Alert type="info" description="Congratulations! You have enough credit balance to purchase this plan without any additional pay." showIcon />
          <FullCreditPayButton
            onProvision={() => handleProvisionSubscription('credit')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />
        </>}
        {showCreditCardCombinedRecurringMessage && <Alert
          type="info" description="Credit card information is required when opt-in auto renew. When each renew payment happens, system will try to use your credit as much over charging your card." showIcon />}
          {shouldShowCard && <StripeCardPaymentWidget
            onProvision={() => handleProvisionSubscription('card')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />}
          {shouldShowAliPay && <StripeAlipayPaymentWidget
            onProvision={() => handleProvisionSubscription('alipay')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />}
          {shouldShowPayPal && <PayPalCheckoutButton
            onProvision={() => handleProvisionSubscription('paypal')}
            onCommit={handleSuccessfulPayment}
            onLoading={setLoading}
          />}
        <Divider/>
        <Button block icon={<LeftOutlined />} onClick={() => handleStepChange(0)}>Back to Options</Button>
      </Space>
    }
  ];

  return (
    <Modal
      visible={modalVisible}
      closable={!loading}
      maskClosable={false}
      title="Subscribe plan"
      destroyOnClose={true}
      footer={null}
      width={520}
      onOk={() => onCancel()}
      onCancel={() => onCancel()}
    >
      <Loading loading={loading} message={'In progress. Please do not close the window.'}>
        <Space direction="vertical" size="large" style={{ width: '100%' }} >
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


    </Modal>);
}

PaymentModal.propTypes = {
  planType: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

PaymentModal.defaultProps = {
  visible: false,
};

export default withRouter(PaymentModal);
