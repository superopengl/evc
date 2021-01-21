export function calculateAmountToPay(balanceAmount, price) {
  let balanceDeductAmount = 0;
  let additionalPay = price;
  if (balanceAmount >= price) {
    // Full balance pay. Pay 0
    balanceDeductAmount = price;
    additionalPay = 0;
  } else if (balanceAmount > 0) {
    // Mix pay
    balanceDeductAmount = balanceAmount;
    additionalPay = price - balanceAmount;
  } else {
    // Full pay
    balanceDeductAmount = 0;
    additionalPay = price;
  }

  return { balanceDeductAmount, additionalPay };
}
