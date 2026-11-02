import { usdToRwf } from './currency';

// Customers pay by MoMo USSD to this number; staff check their MoMo statement and
// then accept the order (PENDING -> ORDER_PLACED). Keep in sync with lib/payment.ts
// in the backend repo.
export const MOMO_PAY_NUMBER = '0783523034';

export function momoPayCode(totalUsd: number): string {
  return `*182*1*1*${MOMO_PAY_NUMBER}*${usdToRwf(totalUsd)}#`;
}

/** Payment status derived from the order status (nothing is charged at checkout). */
export function paymentStatusLabel(status: string, paymentPlan?: string): string {
  if (paymentPlan === 'PICKUP_PAY') return 'Pay on Collection at Store';
  return status === 'PENDING' ? 'Not Yet Paid' : 'Paid in Full';
}
