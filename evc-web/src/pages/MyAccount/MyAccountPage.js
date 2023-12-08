import { Card, Button, Modal, Space, Typography, Row, Col, Alert } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { turnOffSubscriptionRecurring, getMyCurrentSubscription, listMySubscriptionHistory } from 'services/subscriptionService';
import MoneyAmount from 'components/MoneyAmount';
import { getMyAccount, listMyCreditHistory } from 'services/accountService';
import ReactDOM from 'react-dom';
import ReferralLinkInput from 'components/ReferralLinkInput';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import loadable from '@loadable/component'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import * as moment from 'moment-timezone';
import MySubscriptionHistoryPanel from './MySubscriptionHistoryPanel';
import { from } from 'rxjs';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));
const CreditHistoryListModal = loadable(() => import('components/CreditHistoryListDrawer'));
const CommissionWithdrawalForm = loadable(() => import('pages/CommissionWithdrawal/CommissionWithdrawalForm'));
const MyCommissionWithdrawalHistoryDrawer = loadable(() => import('pages/CommissionWithdrawal/MyCommissionWithdrawalHistoryDrawer'));

const { Paragraph, Text, Title, Link } = Typography;


const ContainerStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .ant-spin-nested-loading {
    width: 100%;
  }

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;


const StyledRow = styled(Row)`
  // margin-top: 20px;
  // margin-left: auto;
  // margin-right: auto;
`;

const StyledCol = styled(Col)`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const MyAccountPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentSubscription, setCurrentSubscription] = React.useState();
  const [planType, setPlanType] = React.useState();
  const [creditHistoryVisible, setCreditHistoryVisible] = React.useState(false);
  const [commissionWithdrawalHistoryVisible, setCommissionWithdrawalHistoryVisible] = React.useState(false);
  const [cashBackVisible, setCashBackVisible] = React.useState(false);
  const [account, setAccount] = React.useState({});
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const load = async (refreshAuthUser = false) => {
    try {
      setLoading(true);
      const account = await getMyAccount();
      const subscription = await getMyCurrentSubscription();
      const user = refreshAuthUser ? await getAuthUser() : null;
      const subscriptionHistory = await listMySubscriptionHistory();

      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(account);
        setCurrentSubscription(subscription);
        if (refreshAuthUser) {
          context.setUser(user);
        }
        setSubscriptionHistory(subscriptionHistory);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(load(false)).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleFetchMyCreditHistoryList = async () => {
    const data = await listMyCreditHistory();
    return (data || []).filter(x => x.amount);
  }

  const currentPlanKey = currentSubscription?.currentType || 'free';
  const isCurrentFree = currentPlanKey === 'free';

  const handleTurnOffRecurring = () => {
    Modal.confirm({
      title: 'Turn off subscription auto-renew',
      icon: <QuestionCircleOutlined />,
      content: 'The change will take effect from your next payment. Continue?',
      okText: 'Yes, turn off auto-renew',
      maskClosable: true,
      onOk: async () => {
        await turnOffSubscriptionRecurring();
        load();
      },
      // cancelText: 'No, keep the current plan',
    });
  }

  const handleChangePlan = (subscription) => {
    if (subscription.key === 'free') {
      return;
    }

    if (currentSubscription?.lastRecurring) {
      Modal.warning({
        title: 'Auto-renew Payment is On',
        content: <Paragraph>
          The auto-renew payment is on for your current or last subscription. You need to turn it off before changing a plan.
        </Paragraph>
      });
      return;
    }

    if (currentSubscription) {
      setPlanType(subscription.key);
      setModalVisible(true);
    } else {
      setPlanType(subscription.key);
      setModalVisible(true);
    }
  }

  const handlePaymentOk = async () => {
    setModalVisible(false);
    await load();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const priceCardSpan = isCurrentFree ? {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 8,
    xl: 8,
    xxl: 8
  } : {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  return (
    <ContainerStyled>
      {!account ? <Loading loading={loading} style={{ width: '100%' }} /> :
        <Space direction="vertical" size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Subscription"
            style={{ width: '100%' }}
          // extra={
          //   <Button key={0} onClick={() => setSubscriptionHistoryVisible(true)}>Subscription History & Billings</Button>
          // }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {currentSubscription && !currentSubscription?.lastRecurring && <Alert type="info" showIcon description={<>
                Your subscription will expire on <Text underline strong>{moment.tz(currentSubscription.end, 'utc').format('D MMM YYYY')}</Text>.
                You can extend the subscription by continue purchasing a new plan.
              </>} />}
              {currentSubscription?.lastRecurring && <Alert type="info" showIcon description={<>
                Auto renew payment is on. The next payment date will be on <Text underline strong>{moment(currentSubscription.end).format('D MMM YYYY')}</Text>.
                You can turn off the auto-renew payment <Link onClick={() => handleTurnOffRecurring(false)}>here</Link>.
              </>} />}
              {!currentSubscription && <Alert type="info" showIcon description={<>
                <FormattedMessage id="text.freeToPaidSuggestion" />
                {account.my1stBuyDiscountPerc > 0 && <strong> <FormattedMessage id="text.initialBuyDiscountMessage" values={{ percentage: account.my1stBuyDiscountPerc * 100 }} /></strong>}
              </>} />}
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '30px auto' }}>
                <StyledRow gutter={[30, 30]} style={{ maxWidth: isCurrentFree ? 900 : 700 }}>
                  {subscriptionDef.filter(x => x.key !== 'free' || isCurrentFree).map(s => <StyledCol key={s.key} {...priceCardSpan}>
                    <SubscriptionCard
                      title={s.title}
                      icon={s.icon}
                      description={s.description}
                      onClick={() => handleChangePlan(s)}
                      price={s.price}
                      discount={account.my1stBuyDiscountPerc}
                      active={s.key === currentPlanKey}
                      interactive={s.key !== 'free'}
                      recurring={currentSubscription?.lastRecurring}
                      unit={s.unit} />
                  </StyledCol>)}
                </StyledRow>
              </div>
            </Space>
            {subscriptionHistory?.length > 0 && <MySubscriptionHistoryPanel data={subscriptionHistory} />}
          </Card>
          <Card
            bordered={false}
            title={<FormattedMessage id="text.referralLinkTitle" />}
            extra={
              <Space><Text><FormattedMessage id="text.haveReferred" /></Text><Title type="success">{account.referralCount}</Title></Space>
            }
          >
            <ReferralLinkInput value={account?.referralUrl} />
            <Paragraph type="secondary" style={{ marginTop: 20 }}>{<FormattedMessage id="text.shareReferralLink" />}</Paragraph>
            <Paragraph type="secondary">
              <FormattedMessage id="text.currentReferralCommissionPercentage" values={{ percentage: <Text>{account.referralCommissionPerc * 100}%</Text> }} />
              <br />
              <FormattedMessage id="text.commissionBalanceDescription2" values={{ amount: <MoneyAmount value={account.referralCommissionPerc * 29} /> }} /><br />
              <FormattedMessage id="text.commissionBalanceDescription3" values={{ amount: <MoneyAmount value={account.referralCommissionPerc * 319} /> }} />
            </Paragraph>
            <Paragraph type="secondary">
              <FormattedMessage id="text.currentReferreeDiscountPercentage" values={{ percentage: <Text>{account.referreeDiscountPerc * 100}%</Text> }} />
            </Paragraph>
          </Card>
          <Card
            bordered={false}
            title={<FormattedMessage id="text.creditBalance" />}
            extra={
              <Title><MoneyAmount type="success" value={account.credit} /></Title>
            }
          >
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Paragraph type="secondary">
                <FormattedMessage id="text.commissionBalanceDescription1" /><br />
              </Paragraph>

              <Button key={0} onClick={() => setCreditHistoryVisible(true)}>
                <FormattedMessage id="text.creditHistory" />
              </Button>
            </Space>
          </Card>
          <Card
            bordered={false}
            title={<Row gutter={[10, 10]} justify="space-between">
              <Col>
                <FormattedMessage id="text.commissionWithdrawal" />
              </Col>
              <Col>
                <Row gutter={[10, 10]}>
                  <Col>
                    <Button type="secondary" onClick={() => setCommissionWithdrawalHistoryVisible(true)}>
                      <FormattedMessage id="text.commissionWithdrawalHistory" />
                    </Button>
                  </Col>
                  <Col>
                    <Button type="primary" onClick={() => setCashBackVisible(true)} disabled={account.credit <= 0}>
                      <FormattedMessage id="text.commissionWithdrawalNew" />
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>}
          >
            <Paragraph type="secondary">
              <FormattedMessage id="text.commissionWithdrawalDescription" />
            </Paragraph>
          </Card>
          <Modal
            visible={modalVisible}
            closable={!paymentLoading}
            maskClosable={false}
            title="Subscribe plan"
            destroyOnClose
            footer={null}
            width={520}
            onOk={handleCancelPayment}
            onCancel={handleCancelPayment}
          >
            <PaymentStepperWidget
              planType={planType}
              discount={account.my1stBuyDiscountPerc}
              onComplete={handlePaymentOk}
              onLoading={loading => setPaymentLoading(loading)}
            />
          </Modal>
          <CreditHistoryListModal
            visible={creditHistoryVisible}
            onOk={() => setCreditHistoryVisible(false)}
            onFetch={handleFetchMyCreditHistoryList}
          />
          <Modal
            title={<FormattedMessage id="text.commissionWithdrawalApplication" />}
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
          <MyCommissionWithdrawalHistoryDrawer
            visible={commissionWithdrawalHistoryVisible}
            onClose={() => setCommissionWithdrawalHistoryVisible(false)}
          />
        </Space>}

    </ContainerStyled>
  );
};

MyAccountPage.propTypes = {};

MyAccountPage.defaultProps = {};

export default withRouter(MyAccountPage);
