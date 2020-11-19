import { Button, Layout, Form, Space, Typography, Input, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { CopyOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';
import { Empty, List } from 'antd';
import { Loading } from 'components/Loading';
import { Tooltip } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { isProfileComplete } from 'util/isProfileComplete';
import { SearchStockInput } from 'components/SearchStockInput';
import { getStockHistory } from 'services/stockService';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { PayPalCheckoutButton } from 'components/PayPalCheckoutButton';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { Alert } from 'antd';
import PaymentModal from 'components/PaymentModal';
import { StockName } from 'components/StockName';
import { adjustBalance, getAccount, getMyAccount } from 'services/accountService';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';
import MoneyAmount from './MoneyAmount';
import { notify } from 'util/notify';
import ReferralLinkInput from './ReferralLinkInput';

const { Paragraph, Text, Title, Link: LinkText } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;

const span = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  xxl: 6
};

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .task-count .ant-badge-count {
    background-color: #15be53;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #15be53 inset;
  }
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const ReferralBalanceForm = (props) => {

  const { user, onOK } = props;
  const [loading, setLoading] = React.useState(true);
  const [newPlan, setNewPlan] = React.useState();
  const [account, setAccount] = React.useState({});
  const [balanceAfter, setBalanceAfter] = React.useState();
  const formRef = React.useRef();

  const loadData = async () => {
    try {
      setLoading(true);
      const account = await getAccount(user.id);
      setAccount(account);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, []);

  const currentSubscription = account.subscription;

  const handleAdjustBalance = async (values) => {
    try {
      setLoading(true);
      const { amount } = values;
      await adjustBalance(user.id, amount);
      notify.success(<>Successfully added <Text strong>${amount.toFixed(2)}</Text> to user <Text code>{user.email}</Text></>);
      formRef.current.resetFields();
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  const handleBalanceValueChange = (changed, values) => {
    const { amount } = values;

    setBalanceAfter((account?.balance || 0) + +amount);
  }

  return (
    <Space direction="vertical" style={{ width: '100%', alignItems: 'center', alignItems: 'stretch' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>Subscription</Title>
        <Title type="success">{currentSubscription?.title || subscriptionDef.find(s => s.key === 'free').title}</Title>
      </Space>
      {currentSubscription && <>
        {currentSubscription.start}
        {currentSubscription.end}
      </>}
      <Divider></Divider>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>Referral</Title>
        <Space><Text type="success">have referred</Text><Title type="success">{account.referralCount}</Title></Space>
      </Space>
      <ReferralLinkInput value={account?.referralUrl}/>
      <Divider></Divider>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={4}>Balance</Title>
        <Title><MoneyAmount type="success" value={account.balance} /></Title>
      </Space>
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <div>After adjustment <MoneyAmount strong value={balanceAfter} /></div>
      </Space>
      <Form
        ref={formRef}
        onFinish={handleAdjustBalance}
        onValuesChange={handleBalanceValueChange}
      >
        <Form.Item label="Adjust amount" name="amount" rules={[{ required: true, type: 'number', message: ' ', whitespace: true }]}
          extra="Adjust the user's balance by adding up some amount. Either + or - number is avaiable."
        >
          <InputNumber block disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" loading={loading}>Add Up To Balance</Button>
        </Form.Item>
      </Form>

    </Space>
  );
};

ReferralBalanceForm.propTypes = {
  user: PropTypes.any.isRequired,
  onOk: PropTypes.func,
};

ReferralBalanceForm.defaultProps = {};

export default ReferralBalanceForm;
