import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const EarnCommissionGuideEn = props => {

  return <>
    <Divider>
      <Title level={4}>
        Referral Program Rules
    </Title>
    </Divider>
    <Title level={5} style={{marginTop: '3rem'}}>
      Who is eligible to be a referrer?
    </Title>
    <Paragraph type="secondary">
      Any EVC account holder can become a referrer.
    </Paragraph>
    <Title level={5} style={{marginTop: '3rem'}}>
      Who is eligible to become a referee?
    </Title>
    <Paragraph type="secondary">
      Your friends or social media followers may be eligible to be referees. To receive commission rewards for referring someone who orders a paid plan on EVC, your referee must be a new EVC user and can’t have more than one account.
    </Paragraph>
    <Title level={5} style={{marginTop: '3rem'}}>
      How do referees/I earn discounts/rewards?
    </Title>
    <Paragraph type="secondary">
      Send the referral link to your friend. When he/she successfully registers as a new user with EVC and <strong>completes the purchase of Pro Member Services</strong> by clicking into the link that you referred:
    </Paragraph>
    <Paragraph type="secondary">
      As a result, <strong>referees will get a 10% discount on their first payment</strong>.
    </Paragraph>
    <Paragraph type="secondary">
      For example, you invite your friend, John, the referee. For his first purchase, he chooses Monthly Pro Member services. He gets a discount of 2.9USD and pays 26.1USD for monthly subscription instead of 29USD. Or he chooses Annual Pro Member services for his first purchase, he gets a discount of 31.9USD and pays 287.1USD for yearly subscription instead of 319USD.
    <br />
      <Text type="danger">
        * If he pays 29USD/month firstly and some time later upgrades to 319USD/year, he can only get a discount of 2.9USD upon his first payment. <strong><u>So, Annual Pro Member services recommended for the first subscription to gain more discount as a referee</u></strong>.
    </Text>
    </Paragraph>
    <Paragraph type="secondary">
      As a referrer, <strong>you will receive commission rewards in the amount of the referee's first purchase discount</strong>.
    </Paragraph>
    <Paragraph type="secondary">
      For example, your friend John, the referee, pays 29USD monthly membership for his first subscription so you will get 2.9USD rewards. Or he pays 319USD yearly membership for his first subscription, you will receive 31.9USD.
    <br />
      <Text type="danger">
        * If the referee makes the first payment of 29USD/month and upgrades to 319USD/year later, you can only receive the first discount amount of 2.9USD as your commission. <strong><u>Recommend our Annual Pro Member to your friends to earn more commission rewards</u></strong>.
    </Text>
    </Paragraph>
    <Title level={5} style={{marginTop: '3rem'}}>
      How do I use commission rewards?
    </Title>
    <Paragraph type="secondary">
      You can apply for withdrawal (the minimum required withdrawal amount is 100USD). Or you can spend the commission rewards by purchasing a new Pro Member subscription, extending an existing one or upgrading your current subscription to another tier.
    <br />
      <Text type="danger">
        * When you apply for commission withdrawal, you must fill out a commission withdrawal application form and provide the real personal identity and PayPal account. We will make the transaction after the application is approved.
    </Text>
    </Paragraph>
  </>
}

EarnCommissionGuideEn.propTypes = {};

EarnCommissionGuideEn.defaultProps = {};

export default withRouter(EarnCommissionGuideEn);
