import React from 'react';
import styled from 'styled-components';
import { Typography, Divider } from 'antd';
import { Logo } from 'components/Logo';
const ContainerStyled = styled.div`
padding: 2rem 1rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 900px;
font-size: 0.9rem;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}
`;
const { Title, Text } = Typography;
const PrivacyPolicyPage = () => (
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center' }}>Privacy Policy</Title>
    <p>
    From time to time EVC may review and update this policy.
      </p>
    <p>
    This statement discloses the privacy, security, and information management guidelines that serve as the basis for our user relationships with respect to users of all websites that display a link to this Privacy Policy and that are published by Easyvaluecheck.com (collectively, “EVC”). EVC is committed to protecting your privacy. We will not disclose personal information about you to any third party without your express consent.  Please read the following to learn more about our privacy policy. Our Privacy Policy is subject to change.
      </p>
    <Title level={2}>
    What information does EVC collect?
      </Title>
    <p>
    By registering with EVC you will need to provide us with some personal data so we can provide you with our services that users benefit from. 
      </p>
    <p>
    We may collect the following information you give us, such as:
    </p>
    <ul>
      <li>email address or other personal information;</li>
      <li>your account information with Google, if you decide to use your Google account to register with us; </li>
      <li>if you want to buy a subscription, we will need your name; and</li>
      <li>when you apply for commission withdrawal, you are required to fill out information for personal identification and PayPal account.
</li>
    </ul>
    <p>You can also add additional information about yourself in the profile settings, however, this is not mandatory.</p>
    <p>
    The following information will not be publicly displayed:
    </p>
    <ul>
      <li>
      your first and last name, phone number, email, company, and address.
      </li>
    </ul>
    <p>
    If you pay for the subscription becoming a user of PRO MEMBER Accounts (a "Paid User"), our third party payment processor will also process information about your debit/credit card, bank account and PayPal account information that we require for the purpose of recording and processing your account registration. 
    </p>
<p>
We may also automatically collect information, such as:
</p>
<ul>
  <li>
  Location information. We may collect your general location information, e.g. your physical or postal addresses or your device’s IP address. 
    </li>
    <li>
    Transaction and financial information. We may collect information related to your transactions on our membership service, including the date and time, amounts charged, and other related transaction details, e.g. commission rewards you earned.
    </li>

</ul>

    <Title level={2}>Cookies</Title>
    <p>
    We use cookies (small text files placed on your device) to administer our Site, gather and analyze statistical information, ensure security, to fight spam, and for advertising purposes. Cookies allow us to optimize the user experience and helps to improve its features. 
    </p>
    <Title level={2}>Log files and IP address</Title>
    <p>
    EVC maintains logs which contain information on anonymous users such as IP address, browser type, operating system, and referring web page. We use this information to track usage and diagnose bugs. IP addresses are not tied to personal data in our log files.
    </p>
    <p>
    We collect the data from the devices you use to access our website: IP address of the device (from which we can also infer the country you are connecting from), operating system, and browser version. We collect this information to prevent spam and abuse of our services. Also, we need this data for our tax purpose to identify certain exemption. 
    </p>

    <Title level={2}>How do we use your information?</Title>
    <p>
    We use your personal data to provide you with services such as email address for authenticating your account. For paid users, we provide subscripted services via email address and contact you regarding your use of such services, e.g., data update alerts sent to your email. 
    </p>
    <p>
    On rare cases, service-related announcements are necessary to send out to your email. For instance, if our service is interrupted for a prolonged time or a major website upgrade. 
    </p>
    <p>
    In general, EVC uses information to fulfill the purposes of your requested products and services, to process and collect your payments, to fulfill orders and contractual obligations, to fulfill customer support requests, to customize the advertising and content you see, to improve our services, to contact you, to conduct research, etc.
    </p>
    <Title level={2} >Who can access this information and who is it shared with?</Title>
    <p>
    We may need to disclose your personal information to others to provide you with our Services, to improve our Services or uphold the law or our terms. The information will be collected by specified EVC employees who need to have access to your personal data to confirm the subscription, process and carry out commission reward withdrawal applications.
    </p>
    <p>
    We may share aggregated user statistics, that does not contain any information to identify individuals nor include personal information with advertisers and other partners. 
    </p>
    <Title level={2} >Storage of personal information</Title>
    <p>
    EVC takes cautious and conscious steps to protect your privacy and confidentiality of your personal information from both technical and system perspectives. We aim to ensure that your information is well protected, however, we also recommend that you do not disclose your login and password to others. 
    </p>
    <p>
    Usage data can be stored for the life of the service starting. Personal data can be stored indefinitely or until a request has been made to delete the information.
    </p>
    <Title level={2}>Third party sites</Title>
    <p>
    We may connect links to other websites from our website. These third-party websites can have separate and independent privacy policies. EVC has no responsibility nor are we liable of any content, activities, or privacy policies of these linked sites. We suggest you read the privacy policy of each and every site that you visit.
    </p>
    <Title level={2}>EU and California user’s privacy rights</Title>
    <p>
      We will also comply with the European Union’s General Data Protection Regulation to the extent that this applies to information we collect. If you are an individual based in the European Union, you can email us to clarify how we treat your information.
    </p>
    <p>
    If you are an eligible California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights. To exercise your California rights and request any of the actions or information under the California Consumer Privacy Act (CCPA), you can contact us by email: <a href="mailto:contact@easyvaluecheck.com" target="_blank" rel="noreferrer">contact@easyvaluecheck.com</a>
    </p>

  </ContainerStyled>

);

PrivacyPolicyPage.propTypes = {};

PrivacyPolicyPage.defaultProps = {};

export default PrivacyPolicyPage;
