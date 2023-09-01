import { Button, Layout, Space, Typography } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Divider } from 'antd';
import { getMyAccount, listMyBalanceHistory } from 'services/accountService';
import MoneyAmount from 'components/MoneyAmount';
import ReferralLinkInput from 'components/ReferralLinkInput';
import BalanceHistoryListModal from 'components/BalanceHistoryListModal';

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


const MyAccountPage = () => {

  const [, setLoading] = React.useState(true);
  const [balanceHistoryVisible, setBalanceHistoryVisible] = React.useState(false);
  const [account, setAccount] = React.useState({});

  const loadSubscrptions = async () => {
    try {
      setLoading(true);

      const account = await getMyAccount();
      setAccount(account);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadSubscrptions();
  }, []);


  const handleFetchMyBalanceHistoryList = async () => {
    const data = await listMyBalanceHistory();
    return (data || []).filter(x => x.amount);
  }

  return (
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%', alignItems: 'stretch' }}>
          {/* <Title>Subscription</Title>
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
            balance={account.balance}
          />}
          <Divider></Divider> */}
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title>Balance</Title>
            <Title><MoneyAmount type="success" value={account.balance} /></Title>
          </Space>

          <Space style={{width: '100%', justifyContent:'space-between'}}>
          <Paragraph type="secondary">The money can be used deduct future payment.</Paragraph>

          <Button key={0} onClick={() => setBalanceHistoryVisible(true)}>Balance History</Button>
          </Space>
          <Divider></Divider>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title>Referral Link</Title>
            <Space><Text>have referred</Text><Title type="success">{account.referralCount}</Title></Space>
          </Space>
          <Paragraph type="secondary">Share this link to invite friends to earn balance.</Paragraph>
          <ReferralLinkInput value={account?.referralUrl} />
        </Space>

        <BalanceHistoryListModal visible={balanceHistoryVisible}
          onOk={() => setBalanceHistoryVisible(false)}
          onFetch={handleFetchMyBalanceHistoryList}
        />
      </ContainerStyled>
  );
};

MyAccountPage.propTypes = {};

MyAccountPage.defaultProps = {};

export default withRouter(MyAccountPage);
