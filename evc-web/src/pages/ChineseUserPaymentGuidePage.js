import React from 'react';
import styled from 'styled-components';
import { Typography, Image, Alert } from 'antd';
import { Logo } from 'components/Logo';
const ContainerStyled = styled.div`
padding: 2rem 1rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 500px;
font-size: 0.9rem;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}

.ant-image {
  border: 1px solid rgba(0,0,0,0.05);
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 3px 10px 0 rgba(0, 0, 0, 0.1);
}
`;
const { Title, Paragraph } = Typography;
const ChineseUserPaymentGuidePage = () => (
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center', marginBottom: 30 }}>中国用户支付指南</Title>
    <Paragraph strong>
      信用卡和带有“银联”标志的储蓄卡，均可付款，流程如下：
    </Paragraph>
    <Title level={5}>1. 如果您持有“银联”标志的信用卡或储蓄卡，请点击“PayPal”。</Title>
    <p><Image width={400} src="/images/cn_guide/3.png" /></p>
    <p>在弹出的页面中，选择 “Pay with a Bank Account or Credit Card”。<br /><Image width={400} src="/images/cn_guide/4.png" /></p>
    <p>在详细页面中，选择 “国家/地区”（Country/Region）下拉选择“中国”（China）。<br /><Image width={400} src="/images/cn_guide/5.png" /></p>
    <p>银联信用卡，请填写卡号、有效期限、CSC（银行卡背面最后三位数）。银联储蓄卡，只需要填写卡号。<br /><Image width={400} src="/images/cn_guide/6.png" /></p>
    <p>最后填写，姓、名、账单地址、联系信息等（必填项），选择“不，我现在不需要账户” ，点击“立即付款”。<br /><Image width={400} src="/images/cn_guide/7.png" /></p>
    <Title level={5}>2. 如果您持有Visa、MasterCard信用卡，请点击“信用卡支付”（Pay By Card）。</Title>
    <p><Image width={400} src="/images/cn_guide/1.png" /></p>
    <p>填写卡号、有效期、CVC安全码（卡片背面最后三位数），点击“信用卡支付”。<br /><Image width={400} src="/images/cn_guide/2.png" /></p>

  </ContainerStyled>

);

ChineseUserPaymentGuidePage.propTypes = {};

ChineseUserPaymentGuidePage.defaultProps = {};

export default ChineseUserPaymentGuidePage;
