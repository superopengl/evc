import { Button, Layout, Modal, Space, Typography, Table, Row, Col } from 'antd';
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
import { StockSearchInput } from 'components/StockSearchInput';
import { getStockHistory } from 'services/stockService';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { PayPalCheckoutButton } from 'components/PayPalCheckoutButton';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { Alert } from 'antd';
import PaymentModal from 'components/PaymentModal';
import { StockName } from 'components/StockName';
import { getMyAccount } from 'services/accountService';
import MoneyAmount from 'components/MoneyAmount';
import ReferralLinkInput from 'components/ReferralLinkInput';
import { cancelSubscription, getMyCurrentSubscription } from 'services/subscriptionService';
import { TimeAgo } from 'components/TimeAgo';
import MySubscriptionListModal from './MySubscriptionListModal';
import { PageHeader } from 'antd';

const { Paragraph, Text, Title, Link: LinkText } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem 4rem;
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

const MySubscriptionPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [historyVisible, setHistoryVisible] = React.useState(false);
  const [currentSubscription, changeToNewSubscription] = React.useState();
  const [planType, setPlanType] = React.useState();

  const loadEntity = async () => {
    try {
      setLoading(true);

      changeToNewSubscription(await getMyCurrentSubscription());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  const currentPlanKey = currentSubscription?.type || 'free';

  const handleChangePlan = (subscription) => {
    if (subscription.key === currentPlanKey) {
      return;
    }
    if (currentSubscription) {
      Modal.confirm({
        title: 'Change subscription',
        icon: <WarningOutlined />,
        description: 'Changing subscription will terminate your current subscription without refund. Continue?',
        okText: 'Yes, continue',
        okButtonProps: {
          danger: true
        },
        onOk: () => {
          setPlanType(subscription.key);
        },
        cancelText: 'No, keep the current plan',
      });
    } else {
      setPlanType(subscription.key);
    }
  }

  const handlePaymentOk = () => {
    setPlanType(null);
    loadEntity();
  }

  const handleCancelPayment = () => {
    setPlanType(null);
  }

  const terminateCurrentSubscription = async () => {

    Modal.confirm({
      title: 'Terminate current subscription',
      icon: <WarningOutlined />,
      okText: 'Yes, terminate it',
      okButtonProps: {
        danger: true
      },
      onOk: async () => {
        try {
          setLoading(true);
          await cancelSubscription(currentSubscription.id);
        } finally {
          setLoading(false);
        }
      },
      cancelText: 'No, keep using it',
    });
  }


  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Loading loading={loading}>
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center', alignItems: 'stretch' }}>
            <PageHeader
              style={{ padding: '16px 0' }}
              title={<Title>Subscription</Title>}
              extra={[
                <Button key={0} onClick={() => setHistoryVisible(true)}>Subscription History</Button>,
                <Button key={1} type="primary" danger onClick={() => terminateCurrentSubscription()}>Terimnate</Button>
              ]}
            />
            {currentSubscription && <>
              <Title>{currentSubscription.title}</Title>
              {currentSubscription.stocks?.map((s, i) => <div key={i}>
                <StockName value={s} />
              </div>)}
            </>}
            <Paragraph type="secondary">One subscription at a time. Please notice the new subscription will take place immidiately and the ongoing subscription will be terminated right away without refunding.</Paragraph>
            <StyledRow gutter={20}>
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
            </StyledRow>
            {planType && <PaymentModal
              visible={!!planType}
              planType={planType}
              onOk={handlePaymentOk}
              onCancel={handleCancelPayment}
            // balance={list.balance}
            />}
          </Space>
        </Loading>
        <MySubscriptionListModal visible={historyVisible} onOk={() => setHistoryVisible(false)} />
      </ContainerStyled>
    </LayoutStyled >
  );
};

MySubscriptionPage.propTypes = {};

MySubscriptionPage.defaultProps = {};

export default withRouter(MySubscriptionPage);
