/**
 * Calculate the next payment date based on the payment day of month
 * @param paymentDay Day of month (1-31)
 * @param fromDate Starting date to calculate from (defaults to today)
 * @returns Next occurrence of that payment day
 */
export function getNextPaymentDate(paymentDay: number, fromDate: Date = new Date()): Date {
  const year = fromDate.getFullYear()
  const month = fromDate.getMonth()
  const day = fromDate.getDate()

  // Try to create a date with the payment day in the current month
  let nextPayment = new Date(year, month, paymentDay)

  // If that date is in the past (already happened this month), move to next month
  if (nextPayment <= fromDate) {
    nextPayment = new Date(year, month + 1, paymentDay)
  }

  return nextPayment
}

/**
 * Get the day before the payment date
 * @param paymentDate The payment date
 * @returns The day before
 */
export function getDayBeforePayment(paymentDate: Date): Date {
  const dayBefore = new Date(paymentDate)
  dayBefore.setDate(dayBefore.getDate() - 1)
  return dayBefore
}
