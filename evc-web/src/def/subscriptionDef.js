import React from 'react';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { FormattedMessage } from 'react-intl';
export const subscriptionDef = [
  {
    key: 'free',
    title: <FormattedMessage id="text.proMemberFree" />,
    unit: <FormattedMessage id="text.proMemberFreePriceUnit" />,
    price: 0,
    icon: <GiCurvyKnife />,
    description: <FormattedMessage id="text.proMemberFreeDescription" />,
  },
  {
    key: 'unlimited_monthly',
    title: <FormattedMessage id="text.proMemberMonthly" />,
    unit: <FormattedMessage id="text.proMemberMonthlyPriceUnit" />,
    price: 29,
    icon: <GiSawedOffShotgun />,
    description: <FormattedMessage id="text.proMemberMonthlyDescription" />,
  },
  {
    key: 'unlimited_yearly',
    title: <FormattedMessage id="text.proMemberAnnually" />,
    unit: <FormattedMessage id="text.proMemberAnnuallyPriceUnit" />,
    price: 319,
    icon: <GiPirateCannon />,
    description: <FormattedMessage id="text.proMemberAnnuallyDescription" />,
  }
];