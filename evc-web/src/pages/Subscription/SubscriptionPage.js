import { Button, Layout, Modal, Space, Typography, Tabs, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined, WarningOutlined } from '@ant-design/icons';
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
import { getMySubscription } from 'services/subscriptionService';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { Alert } from 'antd';
import PaymentModal from 'components/PaymentModal';
import { StockName } from 'components/StockName';

const { Paragraph, Title } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .ant-divider {
    margin: 8px 0 24px;
  }
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
    background-color: #389e0d;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #389e0d inset;
  }
`;

const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const SubscriptionPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [newPlan, setNewPlan] = React.useState();
  const [currentSubscription, setCurrentSubscription] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);
      const sub = await getMySubscription();
      setCurrentSubscription(sub);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubscrptions();
  }, []);

  const isFree = !!currentSubscription;
  const currentPlan = currentSubscription?.type || 'free';

  const handleChangePlan = (subscription) => {
    if(subscription.key === currentPlan) {
      return;
    }
    if(currentSubscription) {
      Modal.confirm({
        title: 'Change subscription',
        icon: <WarningOutlined/>,
        description: 'Changing subscription will terminate your current subscription without refund. Continue?',
        okText: 'Yes, continue',
        okButtonProps: {
          danger: true
        },
        cancelText: 'No, keep the current plan',

      });
    }
    setNewPlan(subscription.key);
  }

  const handlePaymentOk = () => {
    setNewPlan(null);
  }

  const handleCancelPayment = () => {
    setNewPlan(null);
  }


  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
          {currentSubscription && <>
            <Title>{currentSubscription.title}</Title>
            {currentSubscription.stocks?.map((s, i) => <div key={i}>
              <StockName value={s} />
            </div>)}
          </>}

          <StyledRow gutter={20}>
            {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
              <SubscriptionCard
                title={s.title}
                icon={s.icon}
                description={s.description}
                onClick={() => handleChangePlan(s)}
                price={s.price}
                active={s.key === currentPlan}
                unit={s.unit} />
            </StyledCol>)}
          </StyledRow>
          {newPlan && <PaymentModal
            visible={!!newPlan}
            oldPlan={currentPlan}
            newPlan={newPlan}
            excluding={currentSubscription?.symbols}
            onOk={handlePaymentOk}
            onCancel={handleCancelPayment}
          />}
        </Space>
      </ContainerStyled>

    </LayoutStyled >
  );
};

SubscriptionPage.propTypes = {};

SubscriptionPage.defaultProps = {};

export default withRouter(SubscriptionPage);
