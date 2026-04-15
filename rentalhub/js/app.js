// ============================================================
// FILE: js/app.js
// PURPOSE: Main application logic for the USER dashboard.
//          - Renders rental cards
//          - Handles category filtering
//          - Opens rental detail modal
//          - Triggers the booking form
// ============================================================

// ── GLOBAL STATE ──────────────────────────────────────────────
// Tracks which category is currently active
let activeCategory = "all";
let selectedRental = null; // The rental the user is about to book

// ── INITIALIZE DASHBOARD ──────────────────────────────────────
// Called when dashboard.html loads
function initDashboard() {
  // 1. Protect page: redirect to login if not authenticated
  const user = requireAuth(false);
  if (!user) return;

  // 2. Show user's name in the header
  document.getElementById("userGreeting").textContent =
    `Hello, ${user.name.split(" ")[0]}! 👋`;

  // 3. Render category filter buttons
  renderCategoryFilters();

  // 4. Render all rental cards
  renderRentals("all");
}

// ── RENDER CATEGORY FILTERS ───────────────────────────────────
// Creates a button for each category in CATEGORIES_DB
function renderCategoryFilters() {
  const container = document.getElementById("categoryFilters");
  if (!container) return;

  container.innerHTML = CATEGORIES_DB.map(cat => `
    <button
      class="filter-btn ${cat.id === activeCategory ? 'active' : ''}"
      onclick="filterByCategory('${cat.id}')"
    >
      ${cat.icon} ${cat.label}
    </button>
  `).join("");
}

// ── FILTER BY CATEGORY ────────────────────────────────────────
// Updates the active category and re-renders the grid
function filterByCategory(categoryId) {
  activeCategory = categoryId;
  renderCategoryFilters(); // Re-render to update active button style
  renderRentals(categoryId);
}

// ── RENDER RENTAL CARDS ───────────────────────────────────────
// Filters RENTALS_DB by category and builds HTML cards
function renderRentals(categoryId) {
  const container = document.getElementById("rentalsGrid");
  if (!container) return;

  // Filter: show all if categoryId is 'all', else match category
  const filtered = categoryId === "all"
    ? RENTALS_DB
    : RENTALS_DB.filter(r => r.category === categoryId);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>🔍 No rentals found in this category.</p>
      </div>
    `;
    return;
  }

  // Build a card for each rental
  container.innerHTML = filtered.map(rental => `
    <div class="rental-card ${!rental.available ? 'unavailable' : ''}">
      <div class="rental-emoji">${rental.image}</div>
      <div class="rental-info">
        <span class="rental-category">${rental.category}</span>
        <h3 class="rental-title">${rental.title}</h3>
        <p class="rental-desc">${rental.description.substring(0, 80)}...</p>
        <div class="rental-footer">
          <span class="rental-price">${formatPrice(rental.price)}<small>/day</small></span>
          <span class="rental-avail ${rental.available ? 'avail-yes' : 'avail-no'}">
            ${rental.available ? "✅ Available" : "❌ Unavailable"}
          </span>
        </div>
        <button
          class="btn btn-primary"
          onclick="openRentalModal('${rental.id}')"
          ${!rental.available ? 'disabled' : ''}
        >
          ${rental.available ? "📅 Book Now" : "Not Available"}
        </button>
      </div>
    </div>
  `).join("");
}

// ── OPEN RENTAL DETAIL MODAL ──────────────────────────────────
// Shows full rental details + booking form in a modal overlay
function openRentalModal(rentalId) {
  selectedRental = RENTALS_DB.find(r => r.id === rentalId);
  if (!selectedRental) return;

  const modal   = document.getElementById("rentalModal");
  const content = document.getElementById("modalContent");

  // Set today's date as minimum for the date pickers
  const today = new Date().toISOString().split("T")[0];

  content.innerHTML = `
    <div class="modal-rental-header">
      <span class="modal-emoji">${selectedRental.image}</span>
      <div>
        <span class="rental-category">${selectedRental.category}</span>
        <h2>${selectedRental.title}</h2>
        <p class="rental-price-big">${formatPrice(selectedRental.price)}<small>/day</small></p>
      </div>
    </div>

    <p class="modal-description">${selectedRental.description}</p>

    <div class="tags-row">
      ${selectedRental.tags.map(t => `<span class="tag">#${t}</span>`).join("")}
    </div>

    <hr class="divider">

    <h3>📅 Select Rental Dates</h3>
    <div class="date-row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" id="startDate" min="${today}" onchange="updatePricePreview()">
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="date" id="endDate" min="${today}" onchange="updatePricePreview()">
      </div>
    </div>

    <div id="pricePreview" class="price-preview" style="display:none">
      <span id="previewText">Estimated Total: ₱0.00</span>
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="submitBooking()">✅ Confirm Booking</button>
    </div>
  `;

  // Show the modal
  modal.style.display = "flex";
}

// ── CLOSE MODAL ───────────────────────────────────────────────
function closeModal() {
  document.getElementById("rentalModal").style.display = "none";
  selectedRental = null;
}

// ── UPDATE PRICE PREVIEW ──────────────────────────────────────
// Shows estimated total price as user picks dates
function updatePricePreview() {
  const startDate = document.getElementById("startDate").value;
  const endDate   = document.getElementById("endDate").value;

  if (!startDate || !endDate || !selectedRental) return;

  const total   = calculatePrice(selectedRental.id, startDate, endDate);
  const preview = document.getElementById("pricePreview");
  const text    = document.getElementById("previewText");

  if (total > 0) {
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
    text.textContent = `${days} day(s) × ${formatPrice(selectedRental.price)} = ${formatPrice(total)}`;
    preview.style.display = "block";
  }
}

// ── SUBMIT BOOKING ────────────────────────────────────────────
// Creates the booking and shows the payment upload step
function submitBooking() {
  const user      = getCurrentUser();
  const startDate = document.getElementById("startDate").value;
  const endDate   = document.getElementById("endDate").value;

  // Validate fields are filled in
  if (!startDate || !endDate) {
    showToast("⚠️ Please select both start and end dates.", "warning");
    return;
  }

  // Try to create the booking
  const result = createBooking(user.id, selectedRental.id, startDate, endDate);

  if (!result.success) {
    showToast("❌ " + result.message, "error");
    return;
  }

  // Booking created! Now show payment instructions
  showPaymentStep(result.booking);
}

// ── SHOW PAYMENT STEP ─────────────────────────────────────────
// After booking is created, show QR / payment upload UI
function showPaymentStep(booking) {
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div class="payment-step">
      <div class="success-icon">🎉</div>
      <h2>Booking Created!</h2>
      <p>Your booking is <strong>pending approval</strong>.</p>
      <p>Booking ID: <code>${booking.id}</code></p>
      <p>Total Amount: <strong>${formatPrice(booking.totalPrice)}</strong></p>

      <hr class="divider">

      <h3>💳 Payment Instructions</h3>
      <div class="qr-placeholder">
        <p>📱 Scan QR or send payment to:</p>
        <div class="payment-details">
          <strong>GCash: 0917-000-0000</strong><br>
          <strong>BDO: 1234-5678-9012</strong><br>
          <small>Account Name: RentHub PH</small>
        </div>
      </div>

      <div class="form-group">
        <label>📎 Upload Payment Proof (screenshot)</label>
        <input type="file" id="paymentProofFile" accept="image/*" onchange="previewProof(event)">
        <img id="proofPreview" style="display:none; max-width:100%; margin-top:8px; border-radius:8px;">
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="submitPaymentProof('${booking.id}')">
          📤 Submit Proof
        </button>
      </div>
    </div>
  `;
}

// ── PREVIEW UPLOADED IMAGE ────────────────────────────────────
function previewProof(event) {
  const file    = event.target.files[0];
  const preview = document.getElementById("proofPreview");
  if (!file) return;

  const reader  = new FileReader();
  reader.onload = e => {
    preview.src     = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file); // Convert image to base64 string
}

// ── SUBMIT PAYMENT PROOF ──────────────────────────────────────
function submitPaymentProof(bookingId) {
  const fileInput = document.getElementById("paymentProofFile");
  const file      = fileInput.files[0];

  if (!file) {
    showToast("⚠️ Please upload your payment screenshot.", "warning");
    return;
  }

  const reader  = new FileReader();
  reader.onload = e => {
    uploadPaymentProof(bookingId, e.target.result);
    showToast("✅ Payment proof submitted! Awaiting admin approval.", "success");
    closeModal();
    renderMyBookings(); // Refresh the bookings list
  };
  reader.readAsDataURL(file);
}

// ── RENDER MY BOOKINGS ────────────────────────────────────────
// Shows the logged-in user's booking history
function renderMyBookings() {
  const user      = getCurrentUser();
  const container = document.getElementById("myBookings");
  if (!container) return;

  const bookings  = getUserBookings(user.id);

  if (bookings.length === 0) {
    container.innerHTML = `<p class="empty-state">You have no bookings yet. Browse and book a rental!</p>`;
    return;
  }

  container.innerHTML = bookings.map(b => {
    const rental = RENTALS_DB.find(r => r.id === b.rentalId) || {};
    return `
      <div class="booking-card">
        <span class="booking-emoji">${rental.image || "📦"}</span>
        <div class="booking-info">
          <h4>${rental.title || "Unknown Rental"}</h4>
          <p>📅 ${b.startDate} → ${b.endDate} (${b.totalDays} day(s))</p>
          <p>💰 Total: ${formatPrice(b.totalPrice)}</p>
          <p>📎 Payment: ${b.paymentProof ? "✅ Uploaded" : "⚠️ Not uploaded yet"}</p>
        </div>
        <div class="booking-status">
          ${getStatusBadge(b.status)}
        </div>
      </div>
    `;
  }).join("");
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
// Shows a small popup message at the bottom of the screen
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── SWITCH DASHBOARD TABS ─────────────────────────────────────
// Shows either "Browse Rentals" or "My Bookings" section
function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));

  document.getElementById(`tab-${tabName}`).style.display = "block";
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Load bookings when switching to that tab
  if (tabName === "bookings") renderMyBookings();
}
