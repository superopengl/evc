import { CheckOutlined } from '@ant-design/icons';
import React from 'react';
import { GiCurvyKnife, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { FormattedMessage } from 'react-intl';
import { Space } from 'antd';
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

/**
 * The feature ticks used to be <Text type="success">, i.e. antd's colorSuccess (#57BB60) at
 * 14px. A 1px icon stroke in that green sits at roughly 2.3:1 on the pale card washes, so it
 * read as a grey smudge rather than a tick.
 *
 * A filled disc with a knocked-out white check fixes that for good: a solid 18px shape
 * carries at any background, and the mark itself is white rather than a hairline of green
 * on green. Not antd's CheckCircleFilled - that one cuts the check out of the disc, so the
 * "white" would actually be whatever wash is behind it, which differs per card.
 *
 * --evc-signal-deep rather than --evc-signal: white on #2f7a38 is 5.3:1, where on the signal
 * itself it is 3.4:1 and the check starts to dissolve into the disc.
 */
const Tick = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--evc-signal-deep);
  color: #ffffff;
  font-size: 10px;
  /* Space align="start" pins this to the top of the line box, which sits ~2px above the
     cap height of the 14px/1.55 label beside it. */
  margin-block-start: 2px;

  .anticon svg {
    stroke: currentColor;
    stroke-width: 80;
  }
`;


// `tint` is the card wash on the homepage pricing band. The three run cyan -> mint -> green,
// picked off the hero's own bands, so the plans read as a progression instead of three
// identical white boxes on the navy. Call sites that omit it get the plain white card.
export const subscriptionDef = [
  {
    key: 'free',
    tint: { bg: '#e9f6fb', border: '#cbe7f2' },
    title: <FormattedMessage id="text.proMemberFree" />,
    unit: <FormattedMessage id="text.proMemberFreePriceUnit" />,
    price: 0,
    icon: <GiCurvyKnife />,
    description:
      <DescriptionContainer>
        <FeatureList>
          <Space align="start">
            <Tick><CheckOutlined /></Tick>
            <FormattedMessage id="text.pricingDescriptionFree" />
          </Space>
        </FeatureList>
      </DescriptionContainer>,
  },
  {
    key: 'pro_member_monthly',
    tint: { bg: '#edf9ef', border: '#d3ecd8' },
    title: <FormattedMessage id="text.proMemberMonthly" />,
    unit: <FormattedMessage id="text.proMemberMonthlyPriceUnit" />,
    price: 29,
    icon: <GiSawedOffShotgun />,
    description:
      <DescriptionContainer>
        <FeatureList>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription1" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription2" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription3" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription6" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription7" /></Space>
          {/* <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription8" /></Space> */}
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription9" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescriptionOneMonth" /></Space>
        </FeatureList>
      </DescriptionContainer>,
  },
  {
    key: 'pro_member_yearly',
    tint: { bg: '#e0f2e4', border: '#c2e4c9' },
    title: <FormattedMessage id="text.proMemberAnnually" />,
    unit: <FormattedMessage id="text.proMemberAnnuallyPriceUnit" />,
    price: 319,
    icon: <GiPirateCannon />,
    description:
      <DescriptionContainer>
        <FeatureList>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription1" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription2" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription3" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription6" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription7" /></Space>
          {/* <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription8" /></Space> */}
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescription9" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescriptionOneYear" /></Space>
          <Space align="start"><Tick><CheckOutlined /></Tick><FormattedMessage id="text.pricingDescriptionOneYearSave" /></Space>
        </FeatureList>
      </DescriptionContainer>,
  }
];