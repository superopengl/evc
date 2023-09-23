import { Card, Button, Modal, Space, Typography, Row, Col, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { getSubscriptionName } from 'util/getSubscriptionName';
import PaymentModal from 'components/checkout/PaymentModal';
import { cancelSubscription, getMyCurrentSubscription } from 'services/subscriptionService';
import { TimeAgo } from 'components/TimeAgo';
import { PageHeader } from 'antd';
import { Tag } from 'antd';
import MoneyAmount from 'components/MoneyAmount';
import { getMyAccount, listMyBalanceHistory } from 'services/accountService';
import ReactDOM from 'react-dom';
import ReferralLinkInput from 'components/ReferralLinkInput';
import BalanceHistoryListModal from 'components/BalanceHistoryListModal';
import MySubscriptionHistoryDrawer from './MySubscriptionHistoryDrawer';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import CommissionWithdrawalForm from 'pages/Profile/CommissionWithdrawalForm';

const { Paragraph, Text, Title } = Typography;


const ContainerStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;

const span = {
  xs: 24,
  sm: 24,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 8
};


const StyledRow = styled(Row)`
  // margin-top: 20px;
  // margin-left: auto;
  // margin-right: auto;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const MyAccountPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentSubscription, changeToNewSubscription] = React.useState();
  const [planType, setPlanType] = React.useState();
  const [balanceHistoryVisible, setBalanceHistoryVisible] = React.useState(false);
  const [subscriptionHistoryVisible, setSubscriptionHistoryVisible] = React.useState(false);
  const [cashBackVisible, setCashBackVisible] = React.useState(false);
  const [account, setAccount] = React.useState({});
  const context = React.useContext(GlobalContext);

  const load = async (refreshAuthUser = false) => {
    try {
      setLoading(true);
      const account = await getMyAccount();
      const subscription = await getMyCurrentSubscription();
      const user = refreshAuthUser ? await getAuthUser() : null;

      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(account);
        changeToNewSubscription(subscription);
        if (refreshAuthUser) {
          context.setUser(user);
        }
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(false);
  }, []);

  const handleFetchMyBalanceHistoryList = async () => {
    const data = await listMyBalanceHistory();
    return (data || []).filter(x => x.amount);
  }

  const currentPlanKey = currentSubscription?.type || 'free';
  const isCurrentFree = currentPlanKey === 'free';

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription(currentSubscription.id);
      load(true);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelCurrentPlan = () => {
    Modal.confirm({
      title: 'Cancel subscription',
      icon: <WarningOutlined />,
      content: 'Changing back to free plan will terminate your current subscription without refund. Continue?',
      okText: 'Yes, continue',
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      onOk: async () => {
        await handleCancelSubscription();
      },
      cancelText: 'No, keep the current plan',
    });
  }

  const handleChangePlan = (subscription) => {
    if (subscription.key === currentPlanKey) {
      return;
    }
    if (subscription.key === 'free') {
      handleCancelCurrentPlan();
    } else if (currentSubscription) {
      Modal.confirm({
        title: 'Change subscription',
        icon: <WarningOutlined />,
        content: 'Changing subscription will terminate your current subscription without refund. Continue?',
        okText: 'Yes, continue',
        maskClosable: true,
        okButtonProps: {
          danger: true
        },
        onOk: () => {
          setPlanType(subscription.key);
          setModalVisible(true);
        },
        cancelText: 'No, keep the current plan',
      });
    } else {
      setPlanType(subscription.key);
      setModalVisible(true);
    }
  }

  const handlePaymentOk = () => {
    setModalVisible(false);
    load();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const terminateCurrentSubscription = async () => {

    Modal.confirm({
      title: 'Terminate current subscription',
      icon: <WarningOutlined />,
      okText: 'Yes, terminate it',
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      onOk: async () => {
        await handleCancelSubscription();
      },
      cancelText: 'No, keep it',
    });
  }


  return (
    <ContainerStyled>
      <Loading loading={loading} style={{ width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'stretch', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Subscription"
            extra={
              <Space>
                <Button key={0} onClick={() => setSubscriptionHistoryVisible(true)}>Subscription History</Button>
                {!isCurrentFree && <Button key={1} type="primary" danger onClick={() => terminateCurrentSubscription()}>Terminate</Button>}
              </Space>
            }
          >
            <Paragraph type="secondary">One subscription at a time. Please notice the new subscription will take place immidiately and the ongoing subscription will be terminated right away without refunding.</Paragraph>
            <StyledRow gutter={[30, 30]} style={{ maxWidth: 800 }}>
              {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
                <SubscriptionCard
                  title={s.title}
                  icon={s.icon}
                  description={s.description}
                  onClick={() => handleChangePlan(s)}
                  price={s.price}
                  active={s.key === currentPlanKey}
                  unit={s.unit} />
              </StyledCol>)}

              {currentSubscription && <Col span={24}>
                {/* <Title level={4}>{getSubscriptionName(currentSubscription.type)}</Title> */}
                <Space direction="vertical">
                  <Text>Started <TimeAgo value={currentSubscription.start} direction="horizontal" /></Text>
                  <Text>Next payment <TimeAgo value={currentSubscription.end} direction="horizontal" /></Text>
                </Space>
              </Col>}
            </StyledRow>
          </Card>
          <Card
            bordered={false}
            title="Balance"
            extra={
              <Title><MoneyAmount type="success" value={account.balance} /></Title>
            }
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Paragraph type="secondary">The money can be used deduct future payment.</Paragraph>

              <Button key={0} onClick={() => setBalanceHistoryVisible(true)}>Balance Transactions</Button>
            </Space>
          </Card>
          <Card
            bordered={false}
            title="Referral Link"
            extra={
              <Space><Text>have referred</Text><Title type="success">{account.referralCount}</Title></Space>
            }
          >
            <Paragraph type="secondary">Share this link to invite friends to earn balance.</Paragraph>
            <ReferralLinkInput value={account?.referralUrl} />
          </Card>
          <Card
            bordered={false}
            title="Commission Withdrawal"
            extra={
              <Space>
                <Button type="secondary">All Applications</Button>
                <Button type="primary" onClick={() => setCashBackVisible(true)}>New Application</Button>
              </Space>
            }
          >
            <Paragraph type="secondary">Ongoing applications</Paragraph>
          </Card>
        </Space>
      </Loading>
      <PaymentModal
        visible={modalVisible}
        planType={planType}
        onOk={handlePaymentOk}
        onCancel={handleCancelPayment}
      // balance={list.balance}
      />
      <BalanceHistoryListModal
        visible={balanceHistoryVisible}
        onOk={() => setBalanceHistoryVisible(false)}
        onFetch={handleFetchMyBalanceHistoryList}
      />
      <MySubscriptionHistoryDrawer
        visible={subscriptionHistoryVisible}
        onClose={() => setSubscriptionHistoryVisible(false)}
      />
      <Modal
        title="Commission Withdrawal Application"
        visible={cashBackVisible}
        closable={true}
        maskClosable={false}
        destroyOnClose={true}
        footer={null}
        onOk={() => setCashBackVisible(false)}
        onCancel={() => setCashBackVisible(false)}
        >
        <CommissionWithdrawalForm onOk={() => setCashBackVisible(false)} />
      </Modal>
    </ContainerStyled>
  );
};

MyAccountPage.propTypes = {};

MyAccountPage.defaultProps = {};

export default withRouter(MyAccountPage);
