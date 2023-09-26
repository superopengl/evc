export function calculateAmountToPay(creditAmount, price) {
  let creditDeductAmount = 0;
  let additionalPay = price;
  if (creditAmount >= price) {
    // Full credit pay. Pay 0
    creditDeductAmount = price;
    additionalPay = 0;
  } else if (creditAmount > 0) {
    // Mix pay
    creditDeductAmount = creditAmount;
    additionalPay = price - creditAmount;
  } else {
    // Full pay
    creditDeductAmount = 0;
    additionalPay = price;
  }

  return { creditDeductAmount, additionalPay };
}
