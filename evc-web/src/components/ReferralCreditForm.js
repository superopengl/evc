import { Button, Form, Space, Typography } from 'antd';
import React from 'react';
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import { subscriptionDef } from 'def/subscriptionDef';
import { adjustCredit, getAccount, listUserCreditHistory } from 'services/accountService';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';
import MoneyAmount from './MoneyAmount';
import { notify } from 'util/notify';
import ReferralLinkInput from './ReferralLinkInput';
import { saveCommissionUserPolicy, deleteCommissionUserPolicy } from 'services/commissionPolicyService';
import { saveDiscountUserPolicy, deleteDiscountUserPolicy } from 'services/discountPolicyService';
import CreditHistoryListDrawer from 'components/CreditHistoryListDrawer';
import { TimeAgo } from 'components/TimeAgo';
import { from } from 'rxjs';

const { Paragraph, Text, Title } = Typography;


const Container = styled.div`
.ant-form-item-control-input-content {
  display: flex;
  justify-content: flex-end;
}
`;

const ReferralCreditForm = (props) => {

  const { user } = props;
  const [loading, setLoading] = React.useState(true);
  const [creditHistoryVisible, setCreditHistoryVisible] = React.useState(false);
  const [account, setAccount] = React.useState();
  const [creditAfterAdjust, setCreditAfterAdjust] = React.useState();
  const commissionFormRef = React.useRef();
  const discountFormRef = React.useRef();
  const creditFormRef = React.useRef();

  const loadData = async () => {
    try {
      setLoading(true);
      const account = await getAccount(user.id);
      setAccount(account);
      setCreditAfterAdjust((account?.credit || 0));
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(loadData()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const currentSubscription = account?.subscription;

  const handleAdjustCredit = async (values) => {
    try {
      setLoading(true);
      const { credit } = values;
      await adjustCredit(user.id, credit);
      notify.success(<>Successfully added <Text strong>${credit.toFixed(2)}</Text> to user <Text code>{user.email}</Text></>);
      creditFormRef.current.resetFields();
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  const handleCreditValueChange = (changed, values) => {
    const { credit } = values;

    setCreditAfterAdjust((account?.credit || 0) + +credit);
  }

  const handleSaveCommissionUserPolicy = async values => {
    try {
      setLoading(true);
      await saveCommissionUserPolicy(user.id, values);
      notify.success(<>Successfully set special referral policy to the user</>);
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  const handleSaveDiscountUserPolicy = async values => {
    try {
      setLoading(true);
      await saveDiscountUserPolicy(user.id, values);
      notify.success(<>Successfully set special discount policy to the user</>);
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteSpecialCommission = async () => {
    try {
      setLoading(true);
      await deleteCommissionUserPolicy(user.id);
      notify.success(<>Successfully deleted special referral policy from the user. Now the global policy applies to the user.</>);
      await loadData();
    } finally {
      commissionFormRef.current.setFieldsValue({percentage: null});
      setLoading(false);
    }
  }

  const handleDeleteSpecialDiscount = async () => {
    try {
      setLoading(true);
      await deleteDiscountUserPolicy(user.id);
      notify.success(<>Successfully deleted special discount policy from the user. Now the global policy applies to the user.</>);
      await loadData();
    } finally {
      discountFormRef.current.setFieldsValue({percentage: null});
      setLoading(false);
    }
  }

  const handleFetchMyCreditHistoryList = async () => {
    return await listUserCreditHistory(user.id);
  }

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%', alignItems: 'stretch' }}>
        <div>
          <Title level={4} style={{textAlign: 'center'}}>{subscriptionDef.find(s => s.key === (currentSubscription?.currentType || 'free'))?.title}</Title>
        </div>
        {currentSubscription && <Space>
          <TimeAgo value={currentSubscription.start} />
          <ArrowRightOutlined />
          <TimeAgo value={currentSubscription.end} />
        </Space>}
        <Divider></Divider>

        {/* User referral commission */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>User Referral Commission</Title>
          <Title type="success">{account?.referralCommissionPerc * 100}%</Title>
        </Space>
        <Paragraph type="secondary">Setting this policy will override the global referral policy. The current global policy is <Text strong>{account?.globalReferralCommissionPerc * 100}%</Text>.</Paragraph>
        {account && <Form
          ref={commissionFormRef}
          onFinish={handleSaveCommissionUserPolicy}
          initialValues={{ percentage: account.specialReferralCommissionPerc || null }}>
          <Form.Item label="Commission per referral" name="percentage"
            rules={[{ required: true, type: 'number', min: 0.01, max: 0.99, message: 'Must be 0.01 ~ 0.99', whitespace: true }]}
          >
            <InputNumber
              disabled={loading}
              min={0.01}
              max={0.99}
              step={0.05}
              formatter={value => `${value * 100} %`}
              parser={value => +(value.replace(' %', '')) / 100}
            />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>Set Special Commission</Button>
          </Form.Item>
          <Form.Item>
            <Button
              block
              loading={loading}
              onClick={() => handleDeleteSpecialCommission()}
            >
              Use Global Commission ({account?.globalReferralCommissionPerc * 100}%)
               </Button>
          </Form.Item>
        </Form>}
        <Divider></Divider>

        {/* Referree discount */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>Referree 1st Buy Discount</Title>
          <Title type="success">{account?.referreeDiscountPerc * 100}%</Title>
        </Space>
        <Paragraph type="secondary">Setting this policy will override the global referree discount policy. The current global policy is <Text strong>{account?.globalReferreeDiscountPerc * 100}%</Text>.</Paragraph>
        {account && <Form
          ref={discountFormRef}
          onFinish={handleSaveDiscountUserPolicy}
          initialValues={{ percentage: account.specialReferreeDiscountPerc || null }}>
          <Form.Item label={<>Discount for the 1st buy</>} name="percentage"
            rules={[{ required: true, type: 'number', min: 0.01, max: 0.99, message: 'Must be 0.01 ~ 0.99', whitespace: true }]}
          >
            <InputNumber
              disabled={loading}
              min={0.01}
              max={0.99}
              step={0.05}
              formatter={value => `${value * 100} %`}
              parser={value => +(value.replace(' %', '')) / 100}
            />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>Set Special Discount</Button>
          </Form.Item>
          <Form.Item>
            <Button
              block
              loading={loading}
              onClick={() => handleDeleteSpecialDiscount()}
            >
              Use Global Discount ({account?.globalReferreeDiscountPerc * 100}%)
               </Button>
          </Form.Item>
        </Form>}
        <Divider></Divider>

        {/* Referral link */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>Referral</Title>
          <Space><Text>have referred</Text><Title type="success">{account?.referralCount}</Title></Space>
        </Space>
        <ReferralLinkInput value={account?.referralUrl} />
        <Divider></Divider>

        {/* Credits */}
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>Credit</Title>
          <Title><MoneyAmount type="success" value={account?.credit} /></Title>
        </Space>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <div>After adjustment <MoneyAmount strong value={creditAfterAdjust} /></div>
        </Space>
        <Paragraph type="secondary">
          Adjust the user's credit by adding up some amount. Either + or - number is avaiable.
        </Paragraph>
        <Form
          ref={creditFormRef}
          onFinish={handleAdjustCredit}
          onValuesChange={handleCreditValueChange}
        >
          <Form.Item label="Adjust amount" name="credit" rules={[{ required: true, type: 'number', message: ' ', whitespace: true }]}
          >
            <InputNumber disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>Adjust Credit</Button>
          </Form.Item>
          <Form.Item>
            <Button block onClick={() => setCreditHistoryVisible(true)}>Credit History</Button>
          </Form.Item>
        </Form>

      </Space>
      <CreditHistoryListDrawer visible={creditHistoryVisible}
        onOk={() => setCreditHistoryVisible(false)}
        onFetch={handleFetchMyCreditHistoryList}
      />
    </Container>
  );
};

ReferralCreditForm.propTypes = {
  user: PropTypes.any.isRequired,
  onOk: PropTypes.func,
};

ReferralCreditForm.defaultProps = {};

export default ReferralCreditForm;
