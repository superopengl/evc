import { CheckOutlined } from '@ant-design/icons';
import React from 'react';
import { GiCurvyKnife, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { FormattedMessage } from 'react-intl';
import { Typography, Space } from 'antd';
import styled from 'styled-components';

const FeatureList = styled.div`
margin: 0;
padding: 0;
text-align: left;
display: flex;
flex-direction: column;
`;

const DescriptionContainer = styled.div`
display: flex;
justify-content: center;
`;

const { Text } = Typography;


export const subscriptionDef = [
  {
    key: 'free',
    title: <FormattedMessage id="text.proMemberFree" />,
    unit: <FormattedMessage id="text.proMemberFreePriceUnit" />,
    price: 0,
    icon: <GiCurvyKnife />,
    description:
      <DescriptionContainer>
        <FeatureList>
          <Space align="start">
            <Text type="success"><CheckOutlined /></Text>
            <FormattedMessage id="text.pricingDescriptionFree" />
          </Space>
        </FeatureList>
      </DescriptionContainer>,
  },
  {
    key: 'pro_member_monthly',
    title: <FormattedMessage id="text.proMemberMonthly" />,
    unit: <FormattedMessage id="text.proMemberMonthlyPriceUnit" />,
    price: 29,
    icon: <GiSawedOffShotgun />,
    description: 
    <DescriptionContainer>
    <FeatureList>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription1" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription2" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription3" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription4" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription5" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription6" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription7" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription8" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription9" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescriptionOneMonth" /></Space>
    </FeatureList>
    </DescriptionContainer>,
  },
  {
    key: 'pro_member_yearly',
    title: <FormattedMessage id="text.proMemberAnnually" />,
    unit: <FormattedMessage id="text.proMemberAnnuallyPriceUnit" />,
    price: 319,
    icon: <GiPirateCannon />,
    description: 
    <DescriptionContainer>
    <FeatureList>
    <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription1" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription2" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription3" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription4" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription5" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription6" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription7" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription8" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescription9" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescriptionOneYear" /></Space>
      <Space align="start"><Text type="success"><CheckOutlined /></Text><FormattedMessage id="text.pricingDescriptionOneYearSave" /></Space>
    </FeatureList>
      </DescriptionContainer>,
    }
];