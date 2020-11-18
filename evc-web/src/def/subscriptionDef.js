import React from 'react';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
export const subscriptionDef = [
  {
    key: 'free',
    weight: 0,
    title:'Free',
    unit: 'forever',
    price: '0.00',
    icon: <GiCurvyKnife/>,
    description: "Search history data. Forever free. Goot to start with for students and trail users.",
    payPalPlanId: null,
  },
  {
    key: 'selected_monthly',
    weight: 10,
    title:'Selected Monthly',
    unit: 'per stock per month',
    price: '9.99',
    icon: <GiFireAxe/>,
    description: "Tracking selected stocks. Concentrating on several selected stocks.",
    payPalPlanId: 'P-532692343F934735YL62LAGQ'
  },
  {
    key: 'unlimited_monthly',
    weight: 30,
    title:'Unlimited Monthly',
    unit: 'per month',
    price: '39.99',
    icon: <GiSawedOffShotgun/>,
    description: "Tracking unlimited stocks per month. Best for professtional investor as a trial.",
    payPalPlanId: 'P-8UX22413K5636661SL62FR6A'
  },
  {
    key: 'unlimited_quarterly',
    weight: 90,
    title:'Unlimited Quarterly',
    unit: 'per quarter',
    price: '109.99',
    icon: <GiPirateCannon/>,
    description: "Tracking unlimited stocks per quater. Money saver for porfessinal investors.",
    payPalPlanId: 'P-1B9632838L515502EL62FSOY'
  }
];