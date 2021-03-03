import { Button, Modal, Space, Typography, Row, Col } from 'antd';
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

const { Paragraph, Text, Title } = Typography;


const ContainerStyled = styled.div`
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
  sm: 24,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 8
};


const StyledRow = styled(Row)`
  margin-top: 20px;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const MySubscriptionPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
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
  const isCurrentFree = currentPlanKey === 'free';

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
        try {
          setLoading(true);
          await cancelSubscription(currentSubscription.id);
          loadEntity();
        } finally {
          setLoading(false);
        }
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
    loadEntity();
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
        try {
          setLoading(true);
          await cancelSubscription(currentSubscription.id);
          loadEntity();
        } finally {
          setLoading(false);
        }
      },
      cancelText: 'No, keep using it',
    });
  }


  return (
      <ContainerStyled>
        <Loading loading={loading}>
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center', alignItems: 'stretch' }}>
            <PageHeader
              style={{ padding: '16px 0' }}
              title={<Title>Subscription</Title>}
              extra={[
                <Button key={0} onClick={() => props.history.push('/subscription/history')}>Subscription History</Button>,
                isCurrentFree ? null :  <Button key={1} type="primary" danger onClick={() => terminateCurrentSubscription()}>Terminate</Button>
              ].filter(x => !!x)}
            />
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
            {currentSubscription && <>
              <Title>{getSubscriptionName(currentSubscription.type)}</Title>
              <Space size="small">{currentSubscription.symbols?.map((s, i) => <Tag key={i}>{s}</Tag>)}</Space>
              <Text>Started <TimeAgo value={currentSubscription.start} /></Text>
              <Text>Next payment <TimeAgo value={currentSubscription.end} /></Text>
            </>}
            <PaymentModal
              visible={modalVisible}
              planType={planType}
              onOk={handlePaymentOk}
              onCancel={handleCancelPayment}
            // balance={list.balance}
            />
          </Space>
        </Loading>
      </ContainerStyled>
  );
};

MySubscriptionPage.propTypes = {};

MySubscriptionPage.defaultProps = {};

export default withRouter(MySubscriptionPage);
