/** Booking id → event_id shared by the browser Pixel and the server Conversions API event,
 * so Meta deduplicates them and counts the booking once. */
export const purchaseEventId = (bookingId: number) => `booking_${bookingId}`
