// ============================================================
// FILE: js/admin.js
// PURPOSE: Admin-only functions for managing rentals,
//          categories, and booking approvals.
//
// These functions should only be accessible by users whose
// role is 'admin'. The admin.html page calls requireAuth(true)
// to enforce this.
// ============================================================

// ── APPROVE A BOOKING ─────────────────────────────────────────
// Sets the booking status to 'approved'
function approveBooking(bookingId) {
  const booking = BOOKINGS_DB.find(b => b.id === bookingId);
  if (!booking) return false;

  booking.status = "approved";
  saveBookings();
  return true;
}

// ── REJECT A BOOKING ──────────────────────────────────────────
// Sets the booking status to 'rejected'
function rejectBooking(bookingId) {
  const booking = BOOKINGS_DB.find(b => b.id === bookingId);
  if (!booking) return false;

  booking.status = "rejected";
  saveBookings();
  return true;
}

// ── GET ALL BOOKINGS (Admin View) ─────────────────────────────
// Returns all bookings with attached user + rental info
function getAllBookingsAdmin(statusFilter = "all") {
  let bookings = [...BOOKINGS_DB];

  // Apply status filter if not 'all'
  if (statusFilter !== "all") {
    bookings = bookings.filter(b => b.status === statusFilter);
  }

  // Attach user and rental details for display
  return bookings.map(b => {
    const user   = USERS_DB.find(u => u.id === b.userId)   || {};
    const rental = RENTALS_DB.find(r => r.id === b.rentalId) || {};
    return { ...b, user, rental };
  });
}

// ── ADD A NEW RENTAL ──────────────────────────────────────────
function addRental(title, description, price, category, image = "📦") {
  const newRental = {
    id:          generateId("r"),
    title,
    description,
    price:       parseFloat(price),
    category,
    image,
    tags:        [],
    available:   true
  };

  RENTALS_DB.push(newRental);
  saveRentals();
  return newRental;
}

// ── UPDATE RENTAL ─────────────────────────────────────────────
function updateRental(rentalId, updates) {
  const index = RENTALS_DB.findIndex(r => r.id === rentalId);
  if (index === -1) return false;

  // Merge updates into existing rental object
  RENTALS_DB[index] = { ...RENTALS_DB[index], ...updates };
  saveRentals();
  return true;
}

// ── DELETE RENTAL ─────────────────────────────────────────────
function deleteRental(rentalId) {
  const index = RENTALS_DB.findIndex(r => r.id === rentalId);
  if (index === -1) return false;

  RENTALS_DB.splice(index, 1); // Remove 1 item at the found index
  saveRentals();
  return true;
}

// ── TOGGLE RENTAL AVAILABILITY ────────────────────────────────
function toggleAvailability(rentalId) {
  const rental = RENTALS_DB.find(r => r.id === rentalId);
  if (!rental) return false;

  rental.available = !rental.available; // Flip true/false
  saveRentals();
  return rental.available;
}

// ── SAVE RENTALS TO LOCALSTORAGE ──────────────────────────────
function saveRentals() {
  localStorage.setItem("rentals", JSON.stringify(RENTALS_DB));
}

// ── LOAD RENTALS FROM LOCALSTORAGE ────────────────────────────
// Replaces the in-memory array with saved data if it exists
function loadRentals() {
  const stored = localStorage.getItem("rentals");
  if (stored) {
    // Replace array contents without reassigning the variable
    const loaded = JSON.parse(stored);
    RENTALS_DB.length = 0;
    RENTALS_DB.push(...loaded);
  }
}

// ── ADMIN STATS ───────────────────────────────────────────────
// Returns summary numbers for the admin dashboard
function getAdminStats() {
  return {
    totalRentals:   RENTALS_DB.length,
    totalBookings:  BOOKINGS_DB.length,
    pendingCount:   BOOKINGS_DB.filter(b => b.status === "pending").length,
    approvedCount:  BOOKINGS_DB.filter(b => b.status === "approved").length,
    rejectedCount:  BOOKINGS_DB.filter(b => b.status === "rejected").length,
    totalRevenue:   BOOKINGS_DB
                      .filter(b => b.status === "approved")
                      .reduce((sum, b) => sum + b.totalPrice, 0)
  };
}

// Load any saved rentals when the script runs
loadRentals();
