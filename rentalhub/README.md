# 🏠 RentHub PH — Rental Booking Website MVP

A **beginner-friendly** rental booking platform built with plain HTML, CSS, and JavaScript.
No frameworks, no build tools — just open the files in a browser and it works!

---

## 🗂️ Folder Structure

```
rental-app/
│
├── index.html        ← Public landing page (no login needed)
├── login.html        ← Login page (simulated Google Auth)
├── dashboard.html    ← User dashboard (protected)
├── admin.html        ← Admin dashboard (protected, admin-only)
│
├── css/
│   └── styles.css    ← ALL styles for every page
│
├── js/
│   ├── auth.js       ← Login, logout, session, role check
│   ├── app.js        ← Rental grid, filtering, booking modal
│   ├── booking.js    ← Create booking, price calc, payment proof
│   └── admin.js      ← Admin stats, approve/reject, manage rentals
│
└── data/
    └── db.js         ← Mock database (JS objects + localStorage)
```

---

## 🚀 How to Run

1. Download or unzip the `rental-app` folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge).
3. That's it! No installation or server needed.

> **Tip:** Use VS Code with the "Live Server" extension for a better experience.

---

## 🔐 Demo Accounts

Use these on the login page to test different roles:

| Account | Email | Role |
|---|---|---|
| Admin User | admin@renthub.com | Admin (full access) |
| Juan dela Cruz | juan@gmail.com | User |
| Maria Santos | maria@gmail.com | User |

---

## 📁 File-by-File Explanation (For Beginners)

### `data/db.js` — The Database
- Stores all rentals, users, and bookings as JavaScript arrays
- Uses `localStorage` to save bookings between page refreshes
- In a real app, this is replaced by Firebase Firestore or a server API

### `js/auth.js` — Authentication
- `loginUser(user)` → Saves the user to localStorage
- `getCurrentUser()` → Gets the currently logged-in user
- `logoutUser()` → Clears the session and redirects to the landing page
- `requireAuth(adminOnly)` → Redirects unauthorized users away from protected pages
- `simulateGoogleLogin(email)` → Our fake "Google Login" for demo purposes

### `js/booking.js` — Booking Logic
- `createBooking(userId, rentalId, startDate, endDate)` → Creates a new booking
- `calculatePrice(rentalId, startDate, endDate)` → Returns estimated total
- `uploadPaymentProof(bookingId, base64Image)` → Stores payment screenshot
- `getUserBookings(userId)` → Returns all bookings for a user
- `getStatusBadge(status)` → Returns colored HTML badge for a status

### `js/admin.js` — Admin Features
- `getAdminStats()` → Returns count of bookings, revenue, etc.
- `getAllBookingsAdmin(filter)` → Returns all bookings with user + rental data
- `approveBooking(bookingId)` / `rejectBooking(bookingId)` → Update status
- `addRental()` / `updateRental()` / `deleteRental()` → Rental CRUD
- `toggleAvailability(rentalId)` → Flips available true/false

### `js/app.js` — Dashboard UI
- `initDashboard()` → Sets up the user dashboard on page load
- `renderRentals(category)` → Draws the rental card grid
- `filterByCategory(categoryId)` → Filters the grid by category
- `openRentalModal(rentalId)` → Opens the booking popup
- `submitBooking()` → Creates a booking and shows payment step
- `renderMyBookings()` → Draws the user's booking history
- `showToast(message, type)` → Shows a popup notification

### `css/styles.css` — All Styles
- Uses **CSS Variables** at the top (`:root { ... }`) — change these to restyle the whole app
- Fonts: `Syne` (headings) + `Nunito` (body) from Google Fonts
- Color scheme: Deep violet primary + amber accent
- Fully responsive for mobile screens

---

## 💡 Beginner Tips

1. **Change the color theme:** Edit the CSS variables in `styles.css` under `:root { }`
2. **Add more rentals:** Add new objects to `RENTALS_DB` in `data/db.js`
3. **Add more categories:** Add to `CATEGORIES_DB` in `data/db.js`
4. **Change the business name:** Search for "RentHub PH" and replace with your brand name

---

## 🚀 How to Scale This App Later

### Step 1: Add Real Google Authentication
Replace the simulated login in `login.html` with Firebase:
```javascript
// 1. Install Firebase: https://firebase.google.com
// 2. Replace simulateGoogleLogin() in auth.js with:
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const auth     = getAuth();
const provider = new GoogleAuthProvider();
signInWithPopup(auth, provider).then(result => {
  const user = result.user;
  loginUser({ id: user.uid, name: user.displayName, email: user.email, role: "user" });
});
```

### Step 2: Replace Mock Database with Firebase Firestore
```javascript
// Instead of RENTALS_DB array, read from Firestore:
import { collection, getDocs } from "firebase/firestore";
const snapshot = await getDocs(collection(db, "rentals"));
const rentals  = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### Step 3: Upload Images to Firebase Storage
```javascript
// Instead of base64 strings for payment proof:
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const storageRef = ref(storage, `proofs/${bookingId}.jpg`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

### Step 4: Backend API (Node.js + Express)
When you have 500+ users, move all data operations to a backend:
- `GET  /api/rentals` → List rentals
- `POST /api/bookings` → Create booking
- `PUT  /api/bookings/:id/approve` → Approve booking
- Connect to MongoDB or PostgreSQL

### Step 5: Real Payment Integration
Replace the manual GCash flow with:
- **PayMongo** (Philippine payment gateway)
- **Stripe** (international cards)

---

## 📌 Current Limitations (MVP)

- Data resets if you clear localStorage
- No email notifications
- No real-time updates (must refresh to see changes)
- Images are stored as base64 (large strings) — use cloud storage in production
- No real Google OAuth yet — demo mode only

These are all intentional for simplicity. Each limitation has a clear upgrade path above.

---

## 🎨 Color Theme Reference

```css
:root {
  --primary:      #5b21b6;  /* Deep violet  */
  --accent:       #f59e0b;  /* Warm amber   */
  --success:      #10b981;  /* Green        */
  --danger:       #ef4444;  /* Red          */
  --bg:           #fafaf9;  /* Off-white    */
}
```

Change `--primary` to `#2563eb` for a blue theme, or `#059669` for a green theme!

---

*Built with ❤️ for beginners. Clean code, no frameworks, no nonsense.*
