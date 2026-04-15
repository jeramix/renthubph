// ============================================================
// FILE: js/booking.js
// PURPOSE: All booking-related logic lives here.
//          - Creating a new booking
//          - Uploading payment proof
//          - Fetching bookings for a specific user
//          - Calculating price based on date range
// ============================================================

// ── CREATE A NEW BOOKING ──────────────────────────────────────
// Called when the user clicks "Confirm Booking"
// Returns the new booking object on success, or an error message.
function createBooking(userId, rentalId, startDate, endDate) {

  // 1. Find the rental in our database
  const rental = RENTALS_DB.find(r => r.id === rentalId);
  if (!rental) return { success: false, message: "Rental not found." };

  // 2. Check if rental is available
  if (!rental.available) {
    return { success: false, message: "Sorry, this rental is currently unavailable." };
  }

  // 3. Validate dates
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time part for comparison

  if (start < today) {
    return { success: false, message: "Start date cannot be in the past." };
  }
  if (end <= start) {
    return { success: false, message: "End date must be after start date." };
  }

  // 4. Calculate number of days and total price
  const msPerDay  = 1000 * 60 * 60 * 24; // Milliseconds in one day
  const totalDays  = Math.ceil((end - start) / msPerDay);
  const totalPrice = totalDays * rental.price;

  // 5. Build the new booking object
  const newBooking = {
    id:           generateId("b"),        // e.g., "b1713182400000"
    userId:       userId,
    rentalId:     rentalId,
    startDate:    startDate,
    endDate:      endDate,
    totalDays:    totalDays,
    totalPrice:   totalPrice,
    status:       "pending",              // Always starts as pending
    paymentProof: null,                   // No proof uploaded yet
    createdAt:    new Date().toISOString().split("T")[0]  // Today's date
  };

  // 6. Add to our in-memory database
  BOOKINGS_DB.push(newBooking);

  // 7. Save to localStorage so it persists on refresh
  saveBookings();

  return { success: true, booking: newBooking };
}

// ── GET ALL BOOKINGS FOR A USER ───────────────────────────────
// Returns only the bookings that belong to the given userId
function getUserBookings(userId) {
  return BOOKINGS_DB.filter(b => b.userId === userId);
}

// ── GET BOOKING DETAILS ───────────────────────────────────────
// Returns full info about a booking + the rental it's for
function getBookingDetails(bookingId) {
  const booking = BOOKINGS_DB.find(b => b.id === bookingId);
  if (!booking) return null;

  // Also attach rental data so we don't need to look it up separately
  const rental  = RENTALS_DB.find(r => r.id === booking.rentalId);
  return { ...booking, rental };
}

// ── UPLOAD PAYMENT PROOF ──────────────────────────────────────
// Stores a base64-encoded image string on the booking record.
// In production, you'd upload this to Firebase Storage / S3.
function uploadPaymentProof(bookingId, base64ImageString) {
  const booking = BOOKINGS_DB.find(b => b.id === bookingId);
  if (!booking) return { success: false, message: "Booking not found." };

  booking.paymentProof = base64ImageString; // Store the image data
  saveBookings();

  return { success: true };
}

// ── CALCULATE PRICE PREVIEW ───────────────────────────────────
// Used to show the estimated price before confirming a booking
function calculatePrice(rentalId, startDate, endDate) {
  const rental = RENTALS_DB.find(r => r.id === rentalId);
  if (!rental || !startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end   = new Date(endDate);

  if (end <= start) return 0;

  const msPerDay  = 1000 * 60 * 60 * 24;
  const totalDays  = Math.ceil((end - start) / msPerDay);
  return totalDays * rental.price;
}

// ── FORMAT CURRENCY ───────────────────────────────────────────
// Converts a number to Philippine Peso format: ₱1,500.00
function formatPrice(amount) {
  return "₱" + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── GET STATUS BADGE HTML ─────────────────────────────────────
// Returns a colored badge for booking status
function getStatusBadge(status) {
  const badges = {
    pending:  '<span class="badge badge-pending">⏳ Pending</span>',
    approved: '<span class="badge badge-approved">✅ Approved</span>',
    rejected: '<span class="badge badge-rejected">❌ Rejected</span>'
  };
  return badges[status] || '<span class="badge">Unknown</span>';
}
