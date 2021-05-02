import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Divider } from 'antd';

const { Title, Text, Paragraph } = Typography;

const EarnCommissionGuideZh = props => {

  return (
    <>
    <Divider>
      <Title level={4}>
      邀请链接说明
    </Title>
    </Divider>
    <Title level={5}>
    谁有资格发起邀请？
    </Title>
    <Paragraph type="secondary">
    任何注册EVC账户的用户（未付费注册用户也可发起邀请）。
    </Paragraph>
    <Title level={5}>
    谁有资格被邀请？
    </Title>
    <Paragraph type="secondary">
    从未注册过EVC的新用户，均可接受邀请。
    </Paragraph>
    <Title level={5}>
    受邀者使用你的邀请链接，首次注册，首次购买，可享受10%折扣
    </Title>
    <Paragraph type="secondary">
    例如：受邀者首次支付，购买29 USD/月会员服务，折扣为2.9 USD，实际支付26.1 USD/月。受邀者首次支付，购买319 USD/年会员服务，折扣为31.9 USD，实际支付287.1/年
    <br />
      <Text type="danger">
        * 如果受邀者先支付29 USD/月，又升级为319 USD/年，只能获得首次支付折扣2.9 USD。<strong><u>建议首次支付选择年费会员，享受更多折扣</u></strong>。
    </Text>
    </Paragraph>
    <Title level={5}>
    你将获得对方首次购买会员费10%的佣金
    </Title>
    <Paragraph type="secondary">
    例如：对方首次支付，购买29 USD/月会员服务，你将获得2.9 USD佣金；对方首次支付，购买319 USD/年会员服务，你将获得31.9 USD佣金。
    <br />
      <Text type="danger">
        * 如果对方先支付29 USD/月，又升级为319 USD/年，你只能获得首次支付的2.9 USD佣金。<strong><u>建议向你的朋友推荐首次支付年会员服务，赚取更多佣金</u></strong>。
    </Text>
    </Paragraph>
    <Title level={5}>
    佣金/余额如何使用？
    </Title>
    <Paragraph type="secondary">
    佣金可<strong><u>申请提现</u></strong>（提现最低100 USD起），佣金也可以作为账户余额，当你订阅Pro会员时，可抵扣会员费用。
    <br />
      <Text type="danger">
        * 佣金提现，必须填写提现申请表，提供个人真实身份和PayPal账号信息，审核通过后发放。
    </Text>
    </Paragraph>
    </>
  )
}

EarnCommissionGuideZh.propTypes = {};

EarnCommissionGuideZh.defaultProps = {};

export default withRouter(EarnCommissionGuideZh);
