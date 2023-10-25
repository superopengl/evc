import { Button, Layout, Form, Space, Typography, Switch, Row, Col } from 'antd';
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
import { saveReferralUserPolicy } from 'services/referralPolicyService';
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
  const [creditAfter, setCreditAfter] = React.useState();
  const formRef = React.useRef();

  const loadData = async () => {
    try {
      setLoading(true);
      const account = await getAccount(user.id);
      setAccount(account);
      setCreditAfter((account?.credit || 0));
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
      const { amount } = values;
      await adjustCredit(user.id, amount);
      notify.success(<>Successfully added <Text strong>${amount.toFixed(2)}</Text> to user <Text code>{user.email}</Text></>);
      formRef.current.resetFields();
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  const handleCreditValueChange = (changed, values) => {
    const { amount } = values;

    setCreditAfter((account?.credit || 0) + +amount);
  }

  const handleSaveReferralUserPolicy = async values => {
    try {
      setLoading(true);
      await saveReferralUserPolicy(user.id, values);
      notify.success(<>Successfully set special referral policy to the user</>);
      await loadData();
    } finally {
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
          <Title level={4}>{subscriptionDef.find(s => s.key === currentSubscription?.type)?.title}</Title>
          {currentSubscription?.symbols?.length > 0 && <Text>{currentSubscription.symbols.join(', ')}</Text>}
        </div>
        {currentSubscription && <Space>
          <TimeAgo value={currentSubscription.start} />
          <ArrowRightOutlined/>
          <TimeAgo value={currentSubscription.end} />
        </Space>}
        <Divider></Divider>
        <Title level={4}>User Referral Policy</Title>
        <Paragraph type="secondary">Setting this policy will override the global referral policy.</Paragraph>
        {account && <Form onFinish={handleSaveReferralUserPolicy} initialValues={account.referralPolicy}>
          <Form.Item label="Override global policy" name="active"
            rules={[{ required: true, message: ' ' }]}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item label="Amount per referral" name="amount"
            rules={[{ required: true, type: 'number', min: 0, message: ' ', whitespace: true }]}
          >
            <InputNumber block disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading}>Set Referral Policy</Button>
          </Form.Item>
        </Form>}
        <Divider></Divider>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>Referral</Title>
          <Space><Text>have referred</Text><Title type="success">{account?.referralCount}</Title></Space>
        </Space>
        <ReferralLinkInput value={account?.referralUrl} />
        <Divider></Divider>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Title level={4}>Credit</Title>
          <Title><MoneyAmount type="success" value={account?.credit} /></Title>
        </Space>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <div>After adjustment <MoneyAmount strong value={creditAfter} /></div>
        </Space>
        <Paragraph type="secondary">
          Adjust the user's credit by adding up some amount. Either + or - number is avaiable.
        </Paragraph>
        <Form
          ref={formRef}
          onFinish={handleAdjustCredit}
          onValuesChange={handleCreditValueChange}
        >
          <Form.Item label="Adjust amount" name="amount" rules={[{ required: true, type: 'number', message: ' ', whitespace: true }]}
          >
            <InputNumber disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined/>}>Adjust Credit</Button>
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
