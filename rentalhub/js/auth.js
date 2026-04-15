// ============================================================
// FILE: js/auth.js
// PURPOSE: Handles all login / logout / session logic.
//
// RIGHT NOW: We SIMULATE Google Login using a dropdown picker.
// This means no real account creation — users pick a demo
// account from a list to test the app.
//
// LATER (Real Google Auth): Replace the mock login with:
//   import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
//   signInWithPopup(auth, new GoogleAuthProvider());
//
// We store the logged-in user in localStorage so the session
// persists even when the page is refreshed.
// ============================================================

// ── SAVE USER TO SESSION ─────────────────────────────────────
// Call this after a successful login.
// We store the whole user object as a JSON string.
function loginUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

// ── GET CURRENT LOGGED-IN USER ───────────────────────────────
// Returns the user object, or null if not logged in.
function getCurrentUser() {
  const raw = localStorage.getItem("loggedInUser");
  if (!raw) return null;
  return JSON.parse(raw); // Convert JSON string back to object
}

// ── LOG OUT ───────────────────────────────────────────────────
// Removes the user from localStorage and redirects to landing page.
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html"; // Go back to landing page
}

// ── CHECK IF USER IS ADMIN ────────────────────────────────────
// Returns true only if current user has role === 'admin'
function checkAdminRole() {
  const user = getCurrentUser();
  return user && user.role === "admin";
}

// ── PROTECT A PAGE (Requires Login) ──────────────────────────
// Call this at the top of any protected page (dashboard, admin).
// If not logged in → redirect to login.
// If not admin (for admin pages) → redirect to dashboard.
function requireAuth(adminOnly = false) {
  const user = getCurrentUser();

  // Not logged in at all → go to login page
  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  // Admin-only page but user is not admin → go to dashboard
  if (adminOnly && user.role !== "admin") {
    alert("⛔ Access denied. Admins only.");
    window.location.href = "dashboard.html";
    return null;
  }

  return user;
}

// ── SIMULATE GOOGLE LOGIN ─────────────────────────────────────
// In a real app, Google pops up a sign-in window.
// Here, we let the user pick from USERS_DB to simulate it.
// The 'email' param matches against our mock user list.
function simulateGoogleLogin(email) {
  // Find user in our mock database by email
  const user = USERS_DB.find(u => u.email === email);

  if (!user) {
    return { success: false, message: "User not found." };
  }

  // Save user to session
  loginUser(user);
  return { success: true, user };
}

// ── REDIRECT AFTER LOGIN ──────────────────────────────────────
// Send user to correct page based on their role
function redirectAfterLogin(user) {
  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
}
