import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Modal, Space } from 'antd';
import { AlipayCircleOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import * as _ from 'lodash';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullBalancePayButton from './FullBalancePayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';

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
  const [willUseBalance, setWillUseBalance] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const fetchPaymentDetail = async (useBalance) => {
    try {
      setLoading(true)
      const detail = await calculatePaymentDetail(planType, useBalance);
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
      fetchPaymentDetail(willUseBalance);
    }
  }, [planType]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);

  const handleUseBalanceChange = checked => {
    fetchPaymentDetail(checked);
    setWillUseBalance(checked);
  }

  const handleRecurringChange = checked => {
    setRecurring(checked);
  }

  const isValidPlan = !!paymentDetail;

  const handleProvisionSubscription = async (method) => {
    const provisionData = await provisionSubscription({
      plan: planType,
      recurring: recurring,
      preferToUseBalance: willUseBalance,
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

  const shouldShowFullBalanceButton = isValidPlan && !recurring && willUseBalance && paymentDetail.additionalPay === 0;
  const shouldShowCard = isValidPlan && (paymentDetail.additionalPay > 0 || recurring);
  const shouldShowPayPal = isValidPlan && !recurring && paymentDetail.additionalPay > 0;
  const shouldShowAliPay = isValidPlan && !recurring && paymentDetail.additionalPay > 0;
  const showBalanceCardCombinedRecurringMessage = recurring && willUseBalance;

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
          <Paragraph>{newPlanDef.description}</Paragraph>
          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Recurring payment?</Text>
            <Switch defaultChecked onChange={handleRecurringChange} />
          </Space>
          {paymentDetail?.totalBalanceAmount > 0 && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Prefer to use balance?</Text>
            <Switch defaultChecked={false} onChange={handleUseBalanceChange} />
          </Space>}
          {willUseBalance && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Total credit:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.totalBalanceAmount} /> : '-'}
          </Space>}
          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Total amount:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.price} /> : '-'}
          </Space>
          {willUseBalance && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Credit deduction:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.balanceDeductAmount * -1} /> : '-'}
          </Space>}
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Total payable amount:</Text>
            {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
          </Space>
          {isValidPlan && <Divider />}
          {isValidPlan && <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {shouldShowFullBalanceButton && <>
              <Alert type="info" description="Congratulations! You have enough balance to purchase this plan without any additional pay." showIcon />
              <FullBalancePayButton onProvision={() => handleProvisionSubscription('balance')} onCommit={handleSuccessfulPayment} />
            </>}
            {showBalanceCardCombinedRecurringMessage && <Alert
              type="info" description="When each plan renew happens, system will try to use your balance as much before charging your card." showIcon />}
            {shouldShowCard && <StripeCardPaymentWidget onProvision={() => handleProvisionSubscription('card')} onCommit={handleSuccessfulPayment} />}
            {shouldShowAliPay && <AlipayButton size="large" icon={<AlipayCircleOutlined />} block style={{fontWeight: 800,fontStyle: 'italic'}}>Alipay</AlipayButton>}
            {shouldShowPayPal && <PayPalCheckoutButton onProvision={() => handleProvisionSubscription('paypal')} onCommit={handleSuccessfulPayment} />}
          </Space>}
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
