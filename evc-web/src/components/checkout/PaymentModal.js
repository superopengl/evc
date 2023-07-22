import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Checkbox, Switch, Divider } from 'antd';
import { signUp } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { PayPalCheckoutButton } from 'components/checkout/PayPalCheckoutButton';
import { Alert, Modal, Space } from 'antd';
import StepWizard from 'react-step-wizard';
import { DoubleRightOutlined, RightOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import { StockSearchInput } from '../StockSearchInput';
import * as _ from 'lodash';
import MoneyAmount from '../MoneyAmount';
import { StripeCheckout } from '../StripeCheckout';
import { Row, Col } from 'antd';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import FullBalancePayButton from './FullBalancePayButton';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';

const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
`;



const PaymentModal = (props) => {

  const { visible, planType, onOk, onCancel } = props;
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);
  const [recurring, setRecurring] = React.useState(true);
  const [selectedSymbols, setSelectedSymbols] = React.useState();
  const [paymentDetail, setPaymentDetail] = React.useState();
  const [willUseBalance, setWillUseBalance] = React.useState(false);
  const wizardRef = React.useRef(null);
  const needsSelectSymbols = planType === 'selected_monthly';


  const fetchPaymentDetail = async (symbols, useBalance) => {
    if (needsSelectSymbols && !symbols?.length) {
      setPaymentDetail({});
      return;
    }
    try {
      setLoading(true)
      const detail = await calculatePaymentDetail(planType, symbols, useBalance);
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
      fetchPaymentDetail(selectedSymbols, willUseBalance);
    }
  }, [planType]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);


  const handleSelectedStockChange = (values) => {
    const { symbols } = values;
    setSelectedSymbols(symbols);
  }

  const handleUseBalanceChange = checked => {
    setWillUseBalance(checked);
    fetchPaymentDetail(selectedSymbols, checked);
  }

  const handleRecurringChange = checked => {
    setRecurring(checked);
  }

  const handleSymbolsChange = list => {
    setSelectedSymbols([...list]);
    fetchPaymentDetail(list, willUseBalance);
  }

  const isValidPlan = (!needsSelectSymbols || selectedSymbols?.length > 0) && paymentDetail;

  const handleProvisionSubscription = async (method) => {
    const provisionData = await provisionSubscription({
      plan: planType,
      recurring: recurring,
      symbols: selectedSymbols,
      preferToUseBalance: willUseBalance,
      method
    });
    return provisionData;
  }

  const handleSuccessfulPayment = async (paymentId, payload) => {
    try {
      setLoading(true);
      await confirmSubscriptionPayment(paymentId, payload);
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

          {needsSelectSymbols &&
            <Form layout="vertical"
              onFinish={() => wizardRef.current.nextStep()}
              onValuesChange={handleSelectedStockChange}
            >
              <Form.Item label="Please choose a stock to subscribe" name="symbols" rules={[{ required: true, message: ' ' }]}>
                <StockSearchInput mode="multiple" onChange={handleSymbolsChange} />
              </Form.Item>
            </Form>
          }
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
            <Text>Balance total amount:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.totalBalanceAmount} /> : '-'}
          </Space>}
          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Total amount:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.price} /> : '-'}
          </Space>
          {willUseBalance && <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Balance deduction:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.balanceDeductAmount * -1} /> : '-'}
          </Space>}
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Total payable amount:</Text>
            {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.additionalPay} /> : '-'}
          </Space>
          {isValidPlan && <Divider />}
          {isValidPlan && <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {shouldShowFullBalanceButton && <>
              <Alert type="info" message="Congratulations! You have enough balance to purchase this plan without any additional pay." showIcon />
              <FullBalancePayButton onProvision={() => handleProvisionSubscription('balance')} onCommit={handleSuccessfulPayment} />
            </>}
            {showBalanceCardCombinedRecurringMessage && <Alert
              type="info" message="When each plan renew happens, system will try to use your balance as much before charging your card." showIcon />}
            {shouldShowCard && <StripeCardPaymentWidget onProvision={() => handleProvisionSubscription('card')} onCommit={handleSuccessfulPayment} />}
            {shouldShowAliPay && <Button size="large" block style={{fontWeight: 800,fontStyle: 'italic'}}>Alipay</Button>}
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
