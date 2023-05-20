import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Checkbox, Layout, Divider } from 'antd';
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
import { SearchStockInput } from './SearchStockInput';
import * as _ from 'lodash';

const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
`;



const PaymentModal = (props) => {

  const { visible, oldPlan, newPlan, excluding, onOk, onCancel } = props;
  const [loading, setLoading] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(visible);
  const wizardRef = React.useRef(null);

  React.useEffect(() => {
    setModalVisible(visible);
  }, [visible]);


  const oldPlanDef = subscriptionDef.find(s => s.key === oldPlan);
  const newPlanDef = subscriptionDef.find(s => s.key === newPlan);

  const payPalPlanId = newPlanDef.payPalPlanId;
  const isDowngrade = oldPlanDef.weight > newPlanDef.weight;

  const isUpgrade = oldPlanDef.weight < newPlanDef.weight;
  const isLeavingFree = oldPlanDef.weight === 0 && isUpgrade;
  const isBackToFree = newPlanDef.weight === 0 && isDowngrade;

  const isAddSingle = newPlan === 'selected_monthly';

  const alertMessage = isBackToFree ? 'Your currnet paid plan will ends after it expires' :
    isDowngrade ? 'You are downgrading plan. The new plan will start after the current plan ends' :
      (isUpgrade && !isLeavingFree) ? "You are upgrading plan. The new plan will start right away and the old plan will cease (no refund)" :
        null;

  const handleSignIn = async (values) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      await signUp(values);

      onOk();
      // Guest
      notify.success(
        '🎉 Successfully signed up!',
        <>Congratulations and thank you very much for signing up Easy Value Check. The invitation email has been sent out to <Text strong>{values.email}</Text>.</>
      );
    } finally {
      setLoading(false);
    }
  }

  const handleSelectedStockChange = (values) => {
    const {symbols} = values;
    debugger;
  }

  return (
    <Modal
      visible={modalVisible}
      closable={true}
      maskClosable={false}
      title="Subscribe plan"
      destroyOnClose={true}
      footer={null}
      onOk={() => onCancel()}
      onCancel={() => onCancel()}
    >
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Title level={3}>{newPlanDef.title}</Title>
        <div><Text strong type="success">$ {newPlanDef.price}</Text> {newPlanDef.unit}</div>
      </Space>
      <Paragraph>{newPlanDef.description}</Paragraph>
      <Divider />
      {isBackToFree ? <>
        <Paragraph>You are going back to free plan. Your current paid plan will cease after it expires.</Paragraph>
        <Button block onClick={() => onOk()}>OK</Button>
      </> :
        <Space direction="vertical" style={{ width: '100%' }} >
          {alertMessage && <Alert message={alertMessage} />}
          <StepWizard ref={wizardRef}>
            {isAddSingle && <div>
              <Form layout="vertical" 
              onFinish={() => wizardRef.current.nextStep()}
              onValuesChange={handleSelectedStockChange}
              >
                <Paragraph type="secondary">Please choose a stock to subscribe.</Paragraph>
                <Form.Item label="Stock" name="symbols" rules={[{ required: true, message: ' ' }]}>
                  <SearchStockInput mode="multiple" excluding={excluding} />
                </Form.Item>
                <Form.Item>
                  <Button block type="primary" ghost htmlType="submit" icon={<DoubleRightOutlined />} />
                </Form.Item>
              </Form>
            </div>}
            <PayPalCheckoutButton payPalPlanId={payPalPlanId} />
          </StepWizard>
        </Space>}
    </Modal>);
}

PaymentModal.propTypes = {
  oldPlan: PropTypes.string.isRequired,
  newPlan: PropTypes.string.isRequired,
  excluding: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

PaymentModal.defaultProps = {
  visible: false,
  excluding: []
};

export default withRouter(PaymentModal);
