import React from 'react';
import HomeRowArea from "./HomeRowArea";
import styled from 'styled-components';
import { Typography } from 'antd';

const { Title } = Typography;

const InfoCard = styled.div`
box-sizing: border-box;
width: 100%;
// margin-top: 2rem;
padding: 1rem;
// border: 1px solid #eeeeee;

h1 {
  // color: #389e0d;
  color: rgba(0,0,0,0.7);
}

p {
  text-align: left;
}
`;


class HomeServiceArea extends React.Component {
  render() {
    const props = {
      bgColor: '',
      span: {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 12,
        xl: 12,
        xxl: 12
      },
      style: {
        // backgroundColor: '#002855',
        // color: '#f0f0f0',
      }
    }

    return (
      <HomeRowArea {...props}>


        <InfoCard >
          <Title>Tax</Title>
          <section>
            <p>Our role as professional tax accountant is to help you navigate your way through the complex world of tax, and provide strategic solutions to legally minimise tax and develop an effective tax strategy.</p>
            <p>We update you for a list of tax issues and reporting, as well as the laws and ATO rulings how to go with it. You have to pay it, but let’s make sure you don’t pay more than you have to.</p>
            <p>We help large companies, SME’s, sole traders, start-up companies and individuals with a range of tax issues. Explore the services we offer:
              <br />Individual tax return
              <br />Corporate Tax
              <br />Good and Services Tax
              <br />Capital Gain Tax
              <br />Fringe Benefit Tax
              <br />ATO Audit Reviews
              Global Compliance Services</p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>Corporate Advisory</Title>
          <section>
            <p>
              I'm a Paragraph. Click here to add your own text and edit me. It’s easy. Just click “Edit Text” or double click me and you can start adding your own content and make changes to the font.
            </p>
            <p>
              Helping potential business owners for the due diligent report before they make a decision to sell, buy, merge or extend your business plan.
            </p>
            <p>
              Due diligent report regarding commercial, industry status, finance position, tax compliance, payroll records, operational, etc.
            </p>
          </section>
        </InfoCard>


        <InfoCard >
          <Title>Business Setting Up & Maintenance</Title>
          <section>
            <p>
              We provide service relating to company, trust, partnership and sole trader setting up, suggesting business owners to choose the most suitable structure.
            </p>
            <p>
              Maintaining your ASIC records including changing address, changing share structure, shareholders, and director.
            </p>
            <p>
              Updating tax registration in ATO for GST, PAYGI, PAYG withholding, etc.
            </p>
          </section>
        </InfoCard>

        <InfoCard >
          <Title>IT Support</Title>
          <section>
            <p>
              Now most of the work has been done over the internet and Information technology is playing a very important role during your daily business operations. Do you feel you have been distressed by more paperwork and complicated processing? And lots of work have been doubled, even tripled. We are helping you to simplify your daily operating process, design your finance policies. This will reduce your finance risk and achieve business success.
            </p>
            <p>
              We help you set up your system initially, training staff to utilise system, migration business to new systems, and even developing new systems to satisfy your requirements.
            </p>
          </section>
        </InfoCard>

      </HomeRowArea>
    );
  }
}

HomeServiceArea.propTypes = {};

HomeServiceArea.defaultProps = {};

export default HomeServiceArea;