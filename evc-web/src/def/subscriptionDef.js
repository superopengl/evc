import React from 'react';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
export const subscriptionDef = [
  {
    key: 'free',
    title:'Free',
    period: 'forever',
    price: '0.00',
    icon: <GiCurvyKnife/>,
    description: "Search history data. Forever free. Goot to start with for students and trail users."
  },
  {
    key: 'single',
    title:'Single',
    period: 'per month',
    price: '9.99',
    icon: <GiFireAxe/>,
    description: "Tracking one stock. Concentrating to single stock with the updated recommendations."
  },
  {
    key: 'unlimited_month',
    title:'Unlimited Month',
    period: 'per month',
    price: '39.99',
    icon: <GiSawedOffShotgun/>,
    description: "Tracking unlimited stocks per month. Best for professtional investor as a trial."
  },
  {
    key: 'unlimited_quarter',
    title:'Unlimited Quarter',
    period: 'per quarter',
    price: '109.99',
    icon: <GiPirateCannon/>,
    description: "Tracking unlimited stocks per quater. Money saver for porfessinal investors."
  }
];