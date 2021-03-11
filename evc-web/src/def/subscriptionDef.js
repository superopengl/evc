import React from 'react';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
export const subscriptionDef = [
  {
    key: 'free',
    title:'Free',
    unit: 'forever',
    price: 0,
    icon: <GiCurvyKnife/>,
    description: "Search history data. Forever free. Goot to start with for students and trail users.",
  },
  {
    key: 'unlimited_monthly',
    title:'Unlimited Monthly',
    unit: 'per month',
    price: 29,
    icon: <GiSawedOffShotgun/>,
    description: "Tracking unlimited stocks per month. Best for professtional investor as a trial.",
  },
  {
    key: 'unlimited_yearly',
    title:'Unlimited Yearly',
    unit: 'per year',
    price: 319,
    icon: <GiPirateCannon/>,
    description: "Tracking unlimited stocks per year. Money saver for porfessinal investors.",
  }
];