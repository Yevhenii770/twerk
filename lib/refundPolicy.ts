// Self-service cancel-and-refund window: a customer gets their money back automatically if
// EITHER condition holds — they're still within the "oops, changed my mind" grace period right
// after paying, OR the class is far enough out that losing the seat isn't a last-minute problem.
// Outside both, we don't auto-refund — they need to contact us directly.
export const REFUND_GRACE_MINUTES = 30;
export const REFUND_CUTOFF_HOURS = 24;

/** Pure eligibility check, kept separate from the DB/Square side effects so it's directly
 * unit-testable: refundable iff paid within the last REFUND_GRACE_MINUTES, or the class is
 * still more than REFUND_CUTOFF_HOURS away (no session at all counts as "far enough out"). */
export function isRefundEligible(params: { paidAt: Date; classStart: Date | null; now?: Date }): boolean {
  const now = params.now ?? new Date();
  const minutesSincePayment = (now.getTime() - params.paidAt.getTime()) / (1000 * 60);
  if (minutesSincePayment < REFUND_GRACE_MINUTES) return true;

  if (!params.classStart) return true;
  const hoursUntilClass = (params.classStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilClass >= REFUND_CUTOFF_HOURS;
}
