// ============================================================
// FILE: data/db.js
// PURPOSE: This is our "mock database" - a JavaScript object
//          that stores all our app data locally.
//          In a real app, this would be replaced by Firebase
//          or a backend API (e.g., Node.js + MongoDB).
// ============================================================

// ── RENTAL LISTINGS ──────────────────────────────────────────
// Each rental has: id, title, description, price, category,
// image (emoji placeholder), and availability flag.
const RENTALS_DB = [
  {
    id: "r001",
    title: "Canon EOS R50 Camera",
    description: "A compact mirrorless camera perfect for photography enthusiasts and content creators. Includes kit lens 18-45mm, extra battery, and carrying case.",
    price: 500,
    category: "Equipment",
    image: "📷",
    tags: ["photography", "mirrorless", "content creation"],
    available: true
  },
  {
    id: "r002",
    title: "DJI Mini 4 Pro Drone",
    description: "Professional drone with 4K video, 48MP photos, and 34-minute flight time. Perfect for aerial photography and videography projects.",
    price: 800,
    category: "Equipment",
    image: "🚁",
    tags: ["drone", "aerial", "4K video"],
    available: true
  },
  {
    id: "r003",
    title: "Toyota Fortuner 2024",
    description: "Spacious 7-seater SUV ideal for road trips, group travel, or events. Includes fuel tank (50% full), GPS navigation, and all-terrain capability.",
    price: 2500,
    category: "Vehicles",
    image: "🚙",
    tags: ["SUV", "7-seater", "road trip"],
    available: true
  },
  {
    id: "r004",
    title: "Honda Click 125i",
    description: "Fuel-efficient automatic scooter for city commuting. Great for daily errands or short trips around the metro.",
    price: 350,
    category: "Vehicles",
    image: "🛵",
    tags: ["scooter", "commute", "fuel-efficient"],
    available: true
  },
  {
    id: "r005",
    title: "Cozy Studio Room – BGC",
    description: "Fully furnished air-conditioned studio with fast WiFi, kitchen access, smart TV, and daily housekeeping. Located near restaurants and malls.",
    price: 1800,
    category: "Rooms",
    image: "🏠",
    tags: ["studio", "furnished", "WiFi"],
    available: true
  },
  {
    id: "r006",
    title: "Event Hall – 100 Guests",
    description: "Modern event hall with sound system, projector, AC, and catering kitchen. Perfect for birthdays, reunions, and corporate events.",
    price: 5000,
    category: "Rooms",
    image: "🏛️",
    tags: ["event", "party", "corporate"],
    available: false // Currently unavailable
  },
  {
    id: "r007",
    title: "Party Tent (10x10m)",
    description: "Heavy-duty aluminum party tent. Includes sidewalls and stakes. Great for outdoor events, garden parties, and fiestas.",
    price: 1200,
    category: "Others",
    image: "⛺",
    tags: ["tent", "outdoor", "party"],
    available: true
  },
  {
    id: "r008",
    title: "Karaoke Machine (Pro)",
    description: "Professional karaoke system with 2 wireless mics, built-in speakers, and 50,000+ songs. Perfect for parties and family gatherings.",
    price: 600,
    category: "Others",
    image: "🎤",
    tags: ["karaoke", "party", "music"],
    available: true
  }
];

// ── CATEGORIES ───────────────────────────────────────────────
// List of rental categories used for filtering
const CATEGORIES_DB = [
  { id: "all",       label: "All Items",  icon: "🗂️" },
  { id: "Equipment", label: "Equipment",  icon: "🔧" },
  { id: "Vehicles",  label: "Vehicles",   icon: "🚗" },
  { id: "Rooms",     label: "Rooms",      icon: "🏠" },
  { id: "Others",    label: "Others",     icon: "📦" }
];

// ── MOCK USERS ────────────────────────────────────────────────
// Pre-loaded demo accounts for testing.
// In production, users are stored in Firebase Auth / your DB.
const USERS_DB = [
  {
    id: "uid001",
    name: "Admin User",
    email: "admin@renthub.com",
    role: "admin",   // 'admin' can approve bookings & manage listings
    avatar: "👨‍💼"
  },
  {
    id: "uid002",
    name: "Juan dela Cruz",
    email: "juan@gmail.com",
    role: "user",    // 'user' can browse and book rentals
    avatar: "👤"
  },
  {
    id: "uid003",
    name: "Maria Santos",
    email: "maria@gmail.com",
    role: "user",
    avatar: "👩"
  }
];

// ── BOOKINGS ──────────────────────────────────────────────────
// Booking records. 'status' can be: pending / approved / rejected
// paymentProof stores a base64 image string after upload
let BOOKINGS_DB = [
  {
    id: "b001",
    userId: "uid002",
    rentalId: "r001",
    startDate: "2026-04-20",
    endDate: "2026-04-22",
    totalDays: 2,
    totalPrice: 1000,
    status: "approved",
    paymentProof: null,
    createdAt: "2026-04-15"
  },
  {
    id: "b002",
    userId: "uid003",
    rentalId: "r003",
    startDate: "2026-04-25",
    endDate: "2026-04-27",
    totalDays: 3,
    totalPrice: 7500,
    status: "pending",
    paymentProof: null,
    createdAt: "2026-04-15"
  }
];

// ── HELPER: Generate a simple unique ID ───────────────────────
// Example: generateId('b') → "b1713182400000"
function generateId(prefix = "id") {
  return prefix + Date.now();
}

// ── HELPER: Save bookings to localStorage ────────────────────
// We persist bookings so they survive a page refresh.
function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(BOOKINGS_DB));
}

// ── HELPER: Load bookings from localStorage ──────────────────
function loadBookings() {
  const stored = localStorage.getItem("bookings");
  if (stored) {
    BOOKINGS_DB = JSON.parse(stored);
  }
}

// Load bookings when db.js is first loaded
loadBookings();
