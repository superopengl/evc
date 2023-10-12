import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider, Steps } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Modal, Space } from 'antd';
import Icon, { AlipayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import * as _ from 'lodash';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullCreditPayButton from './FullCreditPayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { FaCashRegister } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';

const { Title, Text, Paragraph } = Typography;


const AlipayButton = styled(Button)`
  border-color: #108fe9;
  background-color: #108fe9;
  color: white;

  &:active, &:focus, &:hover {
    color:  #108fe9;
    background: white;
    border-color:  #108fe9;
  }
`;

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
          <Text>Recurring payment? (Auto renew subscription at the end day)</Text>
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
        <Button type="primary" block style={{ marginTop: 20 }} disabled={!isValidPlan} onClick={() => handleStepChange(1)}>Next</Button>
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
        </Space>
        {shouldShowFullCreditButton && <>
          <Alert type="info" description="Congratulations! You have enough credit to purchase this plan without any additional pay." showIcon />
          <FullCreditPayButton onProvision={() => handleProvisionSubscription('credit')} onCommit={handleSuccessfulPayment} />
        </>}
        {showCreditCardCombinedRecurringMessage && <Alert
          type="info" description="When each plan renew happens, system will try to use your credit as much before charging your card." showIcon />}
        {shouldShowCard && <StripeCardPaymentWidget onProvision={() => handleProvisionSubscription('card')} onCommit={handleSuccessfulPayment} />}
        {shouldShowAliPay && <AlipayButton size="large" icon={<AlipayCircleOutlined />} block style={{ fontWeight: 800, fontStyle: 'italic' }}>Alipay</AlipayButton>}
        {shouldShowPayPal && <PayPalCheckoutButton onProvision={() => handleProvisionSubscription('paypal')} onCommit={handleSuccessfulPayment} />}
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
      width={600}
      onOk={() => onCancel()}
      onCancel={() => onCancel()}
    >
      <Loading loading={loading} message={'In progress. Please do not close the window.'}>
        <Space direction="vertical" style={{ width: '100%' }} >
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div><Text strong type="success">$ {newPlanDef.price}</Text> {newPlanDef.unit}</div>
          </Space>
          <div style={{ display: 'flex' }}>
            {newPlanDef.description}
          </div>
          <Steps current={currentStep} onChange={handleStepChange} style={{ margin: '30px 0 20px' }}>
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
