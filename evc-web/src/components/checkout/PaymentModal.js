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
  const [willUseBalance, setWillUseBalance] = React.useState(true);
  const wizardRef = React.useRef(null);
  const needsSelectSymbols = planType === 'selected_monthly';


  const loadPaymentDetail = async (symbols, useBalance) => {
    if (needsSelectSymbols && !symbols?.length) {
      setPaymentDetail({});
      return;
    }
    try {
      setLoading(true)
      const result = await calculatePaymentDetail(planType, symbols, useBalance);
      setPaymentDetail(result);
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  React.useEffect(() => {
    if (planType) {
      loadPaymentDetail(selectedSymbols, willUseBalance);
    }
  }, [planType]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);

  const payPalPlanId = newPlanDef.payPalPlanId;

  const handleSelectedStockChange = (values) => {
    const { symbols } = values;
    setSelectedSymbols(symbols);
  }

  const handleUseBalanceChange = checked => {
    setWillUseBalance(checked);
    loadPaymentDetail(selectedSymbols, checked);
  }

  const handleRecurringChange = checked => {
    setRecurring(checked);
  }

  const handleSymbolsChange = list => {
    setSelectedSymbols([...list]);
    loadPaymentDetail(list, willUseBalance);
  }

  const isValidPlan = (!needsSelectSymbols || selectedSymbols?.length > 0) && paymentDetail;

  const handleProvisionSubscription = async () => {
    try {
      setLoading(true);
      const provisionData = await provisionSubscription({
        plan: planType,
        recurring: recurring,
        symbols: selectedSymbols,
        preferToUseBalance: willUseBalance
      });
      return provisionData;
    } catch {
      setLoading(false);
    }
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

      <Loading loading={loading} >
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
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Prefer to use balance?</Text>
            <Switch defaultChecked onChange={handleUseBalanceChange} />
          </Space>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Balance total amount:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.totalBalanceAmount} /> : '-'}
          </Space>
          <Divider />
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Total amount:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.price} /> : '-'}
          </Space>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text>Balance deduction:</Text>
            {paymentDetail ? <MoneyAmount value={paymentDetail.balanceDeductAmount * -1} /> : '-'}
          </Space>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text strong>Total payable amount:</Text>
            {paymentDetail ? <MoneyAmount strong value={paymentDetail.additionalPay} /> : '-'}
          </Space>
          {isValidPlan && <Divider />}
          {isValidPlan && <>
            {paymentDetail.additionalPay === 0 ? <FullBalancePayButton 
            onProvision={handleProvisionSubscription} 
            onCommit={handleSuccessfulPayment} 
            /> :
              <>
                <PayPalCheckoutButton payPalPlanId={''} />
                <StripeCardPaymentWidget onProvision={handleProvisionSubscription} onCommit={handleSuccessfulPayment} />
              </>}
          </>}
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
