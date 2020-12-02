import { PaymentMethod } from '../types/PaymentMethod';

export function calculateAmountToPay(balanceAmount, price) {
  let balanceDeductAmount = 0;
  let additionalPay = price;
  let paymentMethod: PaymentMethod;
  if (balanceAmount >= price) {
    // Full balance pay. Pay 0
    balanceDeductAmount = price;
    additionalPay = 0;
    paymentMethod = PaymentMethod.Balance;
  } else if (balanceAmount > 0) {
    // Mix pay
    balanceDeductAmount = balanceAmount;
    additionalPay = price - balanceAmount;
    paymentMethod = PaymentMethod.BalanceCardMix;
  } else {
    // Full pay
    balanceDeductAmount = 0;
    additionalPay = price;
    paymentMethod = PaymentMethod.Card;
  }

  return { balanceDeductAmount, additionalPay, paymentMethod };
}
