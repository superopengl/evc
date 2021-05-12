import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
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
const { Title } = Typography;
const TermAndConditionPage = () => <>
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center' }}>Terms of Use</Title>
    <p>
      Welcome to Easyvaluecheck.com.
      </p>
    <p>
      <i>
        your affirmative act of using Easyvaluecheck.com ("EVC") or services (the “services”) signifies that you agree to the following terms and conditions of use ("Terms of use"), and you consent to the collection, use and disclosure of personal information as disclosed in the privacy policy. if you do not agree, do not use EVC.
        </i>
    </p>
    <Title level={2}>CHANGES TO THE TERMS OF USE</Title>
    <p>
      We may change these Terms of Use at any time. You can review the most current version of these terms by clicking on the “Terms of Use” link located at the bottom of our web pages. You are responsible for checking these terms periodically for changes. If you continue to use EVC after we post changes to these Terms of Use, you are signifying your acceptance of the new terms.
      </p>
    <Title level={2}>CHANGES TO EVC</Title>
    <p>
      We may discontinue or change any service or feature on EVC at any time and without notice.
      </p>
    <Title level={2}>OWNERSHIP OF INFORMATION; LICENSE TO USE EVC; REDISTRIBUTION OF DATA</Title>
    <p>
      Unless otherwise noted, all right, title and interest in and to EVC, and all information made available through EVC or its Services, in all languages, formats and media throughout the world, including, but not limited to, all copyrights and trademarks therein, are the exclusive property of EVC, its affiliates or its Data Providers. Any Content on websites (a "Site" or "Sites") that are hosted by EVC and/or its affiliates, is owned by or licensed to EVC. You may not capture, record, publish, display, create derivative works of, republish the Content owned or hosted by EVC in whole or in part without consent from EVC or its clients. In no event shall any user publish, retransmit, redistribute or otherwise reproduce any EVC Content in any format to anyone, and no user shall use any EVC Content in or in connection with any business or commercial enterprise, including, without limitation, any securities, investment, accounting, banking, legal or media business or enterprise, without the express written consent of EVC. You may use EVC and the Content offered on EVC only for personal, non-commercial purposes. You may use Content offered for downloading, such as daily data files, for personal use only and subject to the rules that accompany that particular Content.
      </p>
    <p>
      You may not use any data mining, robots, or similar data gathering and extraction tools on the Content, frame any portion of EVC or Content, or reproduce, reprint, copy, store, publicly display, broadcast, transmit, modify, translate, port, publish, sublicense, assign, transfer, sell, loan, or otherwise distribute the Content without our prior written consent. You may not circumvent any mechanisms included in the Content for preventing the unauthorized reproduction or distribution of the Content.
      </p>
    <p>
      Except as otherwise expressly permitted by the preceding paragraph, you agree not to reproduce, retransmit, disseminate, sell, distribute, publish, broadcast or circulate any of the services or materials in any manner or for any purposes (whether personal or business) without the prior express written consent of EVC and/or the data providers. In addition, you shall not, without the prior express written consent of EVC and the relevant data providers, make copies of any of the software or documentation that may be provided, electronically or otherwise, including, but not limited to, translating, decompiling, disassembling or creating derivative works.
      </p>
    <Title level={2}>THIRD PARTY SITES and ADVERTISERS</Title>
    <p>
      EVC may include links to third party websites. Some of these sites may contain materials that are objectionable, unlawful, or inaccurate. You agree that EVC shall not be held liable for any trading activities or other activities that occur on any website you access through links on EVC. We provide these links as a convenience, and do not endorse the content or services offered by these other sites. Any dealings that you have with advertisers found on EVC are between you and the advertiser and you acknowledge and agree that we are not liable for any loss or claim you may have against an advertiser.
      </p>
    <p>EVC does not share your email address with any third-party advertisers.</p>
    <Title level={2}>DISCLAIMER REGARDING CONTENT</Title>
    <p>
      EVC cannot and does not represent or guarantee that any of the information available through the Services or on EVC is accurate, reliable, current, complete or appropriate for your needs. Various information available through the Services or on EVC may be specially obtained by EVC from professional businesses or organizations, such as exchanges, news providers, market data providers and other content providers (e.g., the New York Stock Exchange, NASDAQ, Dow Jones, IEX Cloud, Alpha Vantage, and Trading View), who are believed to be sources of reliable information (collectively, the “Data Providers”). Nevertheless, due to various factors — including the inherent possibility of human and mechanical error — the accuracy, completeness, timeliness, results obtained from use, and correct sequencing of information available through the Services and Website are not and cannot be guaranteed by EVC. Neither EVC nor its affiliates make any express or implied warranties (including, without limitation, any warranty or merchantability or fitness for a particular purpose or use) regarding the Content on EVC. The EVC Content is provided to the users "as is." Neither EVC nor its affiliates will be liable to any user or anyone else for any interruption, inaccuracy, error or omission, regardless of cause, in the EVC Content or for any damages (whether direct or indirect, consequential, punitive or exemplary).
      </p>
    <p>
      We make no warranty and assume no obligation or liability for scripts, indicators, ideas and other content of third parties. Your use of any third-party scripts, indicators, ideas and other content is at your sole risk.
      </p>
    <Title level={2}>DISCLAIMER REGARDING INVESTMENT DECISIONS AND TRADING</Title>
    <p>
      Decisions to buy, sell, hold or trade in securities, commodities and other investments involve risk and are best made based on the advice of qualified financial professionals. Any trading in securities or other investments involves a risk of substantial losses. The practice of “Day Trading” involves particularly high risks and can cause you to lose substantial sums of money. Before undertaking any trading program, you should consult a qualified financial professional. Please consider carefully whether such trading is suitable for you in light of your financial condition and ability to bear financial risks. Under no circumstances shall we be liable for any loss or damage you or anyone else incurs as a result of any trading or investment activity that you or anyone else engages in based on any information or material you receive through EVC or our Services.
      </p>
    <Title level={2}>DISCLAIMER REGARDING HYPOTHETICAL PERFORMANCE RESULTS</Title>
    <p>
      Hypothetical performance results have many inherent limitations, some of which are mentioned below. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown. In fact, there are frequently sharp differences between hypothetical performance results and actual results subsequently achieved by any particular trading program.
      </p>
      <p>
      One of the limitations of hypothetical performance results is that they are generally prepared with the benefit of hindsight. In addition, hypothetical trading does not involve financial risk and no hypothetical trading record can completely account for the impact of financial risk in actual trading. For example the ability to withstand losses or to adhere to a particular trading program in spite of the trading losses are material points, which can also adversely affect trading results. There are numerous other factors related to the market in general or to the implementation of any specific trading program which cannot be fully accounted for in the preparation of hypothetical performance results and all of which can adversely affect actual trading results.
      </p>
    <Title level={2}>REGISTERED USERS</Title>
    <p>
      To register to become users is the first step to use EVC’s services. During the registration process you may be prompted to click an “Sign up,” “Submit” or similar button; your clicking on such button will further confirm your agreement to be legally bound by these Terms and Conditions. If you register as a user of the features of EVC, you can only view limited data. Certain services, such as watchlist, screeners, resistance and support or email alert, are available only to paid subscribers of the EVC membership and require you to sign in with an email address and password to use them.
      </p>
    <p>
      In consideration of your use of the EVC website, you represent that you are of legal age to form a binding contract and are not a person barred from receiving EVC Services under the laws of New Zealand or other applicable jurisdiction. You also agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the EVC’s registration form (the “Registration Data”) and (b) maintain and promptly update the Registration Data to keep it true, accurate, current and complete. If you provide any information that is untrue, inaccurate, not current or incomplete, or EVC has reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, EVC has the right to suspend or terminate your account and refuse any and all current or future use of the EVC Services (or any portion thereof).
      </p>
    <Title level={2}>NON-PROFESSIONAL SUBSCRIBER STATUS</Title>
    <p>
      As a vendor of official real-time market data from exchanges (e.g. Nasdaq 100) for end users, we are required to identify the ‘Non-Professional’ status of any Subscriber. By ordering a subscription for market data on EVC you confirm the following:
      </p>
    <ol>
      <li>
        You use market data solely for personal use, not for your business or any other entity.
        </li>
      <li>
        You are not registered or qualified with the Securities Exchange Commission (SEC) or the Commodities Futures Trading Commission (CFTC).
        </li>
      <li>
        You are not registered or qualified with any securities agency, any securities exchange, association or regulatory body in any country.
        </li>
      <li>
        You do not perform any functions that are similar to those that require an individual to register or qualify with the SEC, the CFTC, any other securities agency, any securities exchange, or association or regulatory body, or any commodities or futures contract market, or association or regulatory body.
  </li>
      <li>
        You are not engaged as an investment advisor or asset manager and you are not engaged to provide investment advice to any individual or entity.
    </li>
      <li>
        You are not subscribing to the service in your capacity as a principal, officer, partner, employee, or agent of any business or on behalf of any other individual.
    </li>
      <li>
        You use your own capital, not provided by any other individual or entity in the conduct of your trading.
    </li>
      <li>
        You do not conduct trading for the benefit of a corporation, partnership, or other entity.
    </li>
      <li>
        You have not entered into any agreement to share the profit of your trading activities or receive compensation for your trading activities.</li>
      <li>
        You are not receiving office space, and equipment or other benefits in exchange for your trading or work as a financial consultant to any person, firm or business entity.
    </li>
    </ol>
    <Title level={2}>ACCESS AND SECURITY</Title>
    <p>You accept responsibility for the confidentiality and use of any email address that you may register for your access to and use of the Services. You are responsible for maintaining the confidentiality of the password and account and are fully responsible for all activities that occur under your password or account. You agree to (a) immediately notify EVC of any unauthorized use of your password or account or any other breach of security, and (b) ensure that you exit from your account at the end of each session. EVC cannot and will not be liable for any loss or damage arising from your failure to comply.</p>
    <Title level={2}>PAYMENT AND CANCELLATION OF SERVICE</Title>
    <p>By ordering any subscription on www.easyvaluecheck.com you confirm that you have read and accepted our Terms of Use and you authorize EVC to automatically charge your bank card or PayPal account according to the billing period manually selected by you. Unless otherwise stated, all subscriptions are automatically renewing.</p>
    <p>There are no refunds for either monthly or annual plan, even if the subscription is canceled on the same day as the auto conversion payment has gone through. The membership service will last through the end of this billing period. </p>
    <p>
      The service is billed in advance on a monthly, or annual basis. EVC does not offer partial cancellations. There will be no refunds or credits for partial months of service, or refunds for months unused. If you cancel the service before the end of your current paid up period, your subscription will remain active until the next due date. After the due date, if no payment received, your subscription will be stopped.
      </p>
    <p>
      All billing is recurring, which means you will continue to get billed until you cancel your subscription. You will get reminding emails several days in a row before the due date of your renewal. If you have been billed for automatic renewal of the Service, you can cancel the subscription to avoid billing for next period. You are solely responsible for properly canceling your EVC subscription. An email request asking for your subscription to be cancelled is not considered cancellation. You may cancel your subscription at any time by visiting the account section after you log in.

      </p>
    <p>
      We do not offer refunds for upgrades to a more expensive plan or a longer billing cycle. Remaining days are added up to an equivalent value of days on the new subscription, i.e., the full term of plan before update will be fully exercised.
      </p>
    <p>
      If you would like to use the credit you earned in our referral program to pay for a plan, you will need to properly cancel your current subscription at the first, then manually pay by “credit balance”. We do not accept the mixed mothed of bank account and credit balance to pay for any plan. The credit balance must be in the sufficient amount to pay for the full price of the subscription.
      </p>
    <Title level={2}>Emails</Title>
    <p>By creating an account with EVC, you agree that EVC can use your email address to send you marketing materials, service-related notices, important information messages, special offers, etc.</p>
    <Title level={2}>Feedback to EVC</Title>
    <p>By submitting ideas, content, suggestions, documents, and/or proposals ("Contributions") to EVC through our contact or feedback webpage, you acknowledge and agree that: (a) your Contributions do not contain confidential or proprietary information; (b) EVC is not under any obligation of confidentiality, expressed or implied, with respect to the Contributions; (c) EVC shall be entitled to use or disclose (or choose not to use or disclose) such Contributions for any purpose, in any way, in any media worldwide; (d) EVC may have something similar to the Contributions already under consideration or in development; (e) your Contributions automatically become the property of EVC, without any obligation of EVC to you; and (f) you are not entitled to any compensation or reimbursement of any kind from EVC under any circumstances.</p>
    <Title level={2}>INDEMNITY</Title>
    <p>
      You agree to indemnify and hold EVC and its subsidiaries, affiliates, officers, agents, employees, partners and licensors harmless from any claim or demand, including reasonable attorneys’ fees, made by any third party due to or arising out of Content you submit, post, transmit, modify or otherwise make available through the EVC Services, your use of the EVC Services, your connection to the EVC Services, your violation of the Terms of Use, or your violation of any rights of another.
      </p>
    <Title level={2}>TERMINATION</Title>
    <p>
      You may terminate your EVC account, any associated email address and access to the EVC Services by submitting such termination request to EVC by email.
      </p>
    <p>
      You agree that EVC may, without prior notice, immediately terminate, limit your access to or suspend your EVC account, any associated email address, and access to the EVC Services. Cause for such termination, limitation of access or suspension shall include, but not be limited to, (a) breaches or violations of the Terms of Use or other incorporated agreements or guidelines, (b) requests by law enforcement or other government agencies, (c) discontinuance or material modification to the EVC Services (or any part thereof), (d) unexpected technical or security issues or problems, (e) extended periods of inactivity, (f) engagement by you in fraudulent or illegal activities, (g) and/or abusive correspondence with EVC. Further, you agree that all terminations, limitations of access and suspensions for cause shall be made in EVC’s sole discretion and that EVC shall not be liable to you or any third party for any termination of your account, any associated email address, or access to the EVC Services.
      </p>
    <Title level={2}>REFERRAL PROGRAM RULES</Title>
    <ul>
      <li>
        <Title level={3}>Who is eligible to be a referrer?</Title>
        <p>
          Any EVC account holder can become a referrer.
    </p>
      </li>
      <li>
        <Title level={3}>Who is eligible to become a referee?</Title>
        <p>
          Your friends or social media followers may be eligible to be referees. To receive commission rewards for referring someone who orders a paid plan on EVC, your referee must be a new EVC user and can not have more than one account.
</p>
      </li>
      <li>
        <Title level={3}>How can I use my referral link?</Title>
        <p>
          EVC wants you to share your referral link and earn EVC commission rewards, but you agree that you will not:
</p>
        <ol type="a">
          <li>
            Try to get referees by spamming, bulk emailing, or sending large numbers of unsolicited emails. The only people you should be emailing are people you know personally;
  </li>
          <li>
            Use scripts or programmed or automatic dialers to send invites or otherwise share your referral link;
  </li>
          <li>
            Use scripts or programmed or automatic dialers to send invites or otherwise share your referral link;
    </li>
          <li>
            Use, display, or manipulate EVC intellectual property (such as EVC logos, trademarks, and copyright-protected works) in any way, except as to identify yourself as a EVC user or a EVC referrer;
    </li>
          <li>
            Create or register any (i) businesses, (ii) URLs, (iii) domain names, (iv) software application names or titles, or (v) social media handles or profiles that include the word "EVC" or any of EVC's other trademarks or any words that are confusingly similar to EVC trademarks.
    </li>
          <li>
            Purchase keywords (including, but not limited to Google AdWords) that contain any of EVC trademarks;
    </li>
          <li>
            Use EVC’s trademarks as your social media profile picture or wallpaper or use any of EVC’s copyright-protected works (such as graphic and screenshots from EVC’s website) without EVC’s express written permission;
    </li>
          <li>
            Make misleading claims about EVC, use offensive/abusive content, create fake websites/webpages/social media profiles/apps, misrepresent your connection to EVC, or otherwise make any false or misleading statements to get a referee to use your link; or
      </li>
          <li>
            Use your referral link in any manner that violates the law or the rights of anyone else.
      </li>
        </ol>
      </li>
      <li>
        <Title level={3}>How do referee/I earn discount/reward?</Title>
        <p>
          Send the referral link to your friend. When he/she successfully registers as a new user with EVC and completes the purchase of Pro Member Services by clicking into the link that you referred.
</p>
        <p>
          As a result, referees will get 10% off discount on their first payment. For example, you invite your friend, John, the referee. For his first purchase, he chooses Monthly Pro Member services. He gets discount of 2.9USD and pays 26.1USD for monthly subscription instead of 29USD. Or he chooses Annual Pro Member services for his first purchase, he gets discount of 31.9USD and pays 287.1USD for yearly subscription instead of 319USD. If he pays 29USD/month firstly and some time later upgrades to 319USD/year, he can only get discount of 2.9USD upon his first payment.
</p>
        <p>
          As a referrer, you will receive commission rewards in the amount of referee’s first purchase discount.
</p>
        <p>
          For example, your friend John, the referee pays 29USD monthly membership for his first subscription so you will get 2.9USD rewards. Or he pays 319USD yearly membership for his first subscription, you will receive 31.9USD. If referee makes the first payment of 29USD/month and upgrades to 319USD/year later, you can only receive the first discount amount of 2.9USD as your commission.
</p>
        <p>
          The requirements for receiving, and the amounts of EVC credit rewards are subject to change at EVC’s sole discretion. Referral rewards in the form of EVC credit are not transferable. EVC may cancel a reward at any time at its sole discretion.
</p>
        <p>
          There are no refunds for any full or partial subscribed plans, you and your referee need to make sure that the order is correct and both sides clearly understand our referral rules and terms and conditions before the payment is made.
</p>
      </li>
      <li>
        <Title level={3}>
          How do I use commission rewards?
</Title>
        <p>
          You can apply for withdrawal (the required minimum withdrawal amount is 100USD). Or you can spend the commission rewards by purchasing a new Pro Member subscription, extending an existing one or upgrading your current subscription to another tier.
</p>
        <p>
          When you apply for commission withdrawal, you must fill out commission withdrawal application form and provide the real personal identity and PayPal account. We will make the transaction after the application is approved.
</p>
      </li>
      <li>
        <Title level={3}>
          Termination and changes
</Title>
        <p>
          EVC reserves the right to change, end, or pause, in whole or in part, any referral program, as well as any referrer’s or referee's ability to participate in any referral program or receive EVC credit rewards at any time for any reason, including suspected fraud (including by either the referrer and/or referee), abuse, or any violation of these Rules.
</p>
      </li>
    </ul>
    <p>
      EVC may update these Rules at any time.
</p>
  </ContainerStyled>
</>;

TermAndConditionPage.propTypes = {};

TermAndConditionPage.defaultProps = {};

export default TermAndConditionPage;
