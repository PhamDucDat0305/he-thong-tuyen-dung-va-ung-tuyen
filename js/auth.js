/* ========== AUTHENTICATION LAYER ========== */
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/**
 * Authentication management object
 */
window.Auth = {
  /**
   * Register a new user with Firebase Auth and Firestore
   */
  async register(username, password, fullName, email, role) {
    try {
      // 1. Create account on Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Prepare user data for Firestore
      const userData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        username,
        email,
        fullName,
        role,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // 3. Save to "users" collection
      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // 4. If employer, create a placeholder company profile
      if (role === "employer") {
        await setDoc(doc(db, "companies", firebaseUser.uid), {
          employerId: firebaseUser.uid,
          name: `${fullName} Company`,
          description: "",
          industry: "",
          size: "",
          location: "",
          website: "",
          logo: '<i class="fa-solid fa-building"></i>',
          createdAt: new Date().toISOString()
        });
      }

      // 5. Update local session
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Auth: register error", error);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") msg = "Email này đã được sử dụng.";
      if (error.code === "auth/weak-password") msg = "Mật khẩu quá yếu (cần ít nhất 6 ký tự).";
      return { success: false, message: msg };
    }
  },

  /**
   * Log in user with email and password
   */
  async login(email, password) {
    try {
      // 1. Sign in via Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Fetch role and profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "Lỗi: Tài khoản tồn tại nhưng không tìm thấy dữ liệu phân quyền!",
        };
      }

      const userData = userDoc.data();

      // 3. Save to local storage
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error("Auth: login error", error);
      let msg = "Email hoặc mật khẩu không chính xác.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        msg = "Email hoặc mật khẩu không chính xác.";
      }
      return { success: false, message: msg };
    }
  },

  /**
   * Log out current user
   */
  async logout() {
    try {
      await signOut(auth);
      
      // Clear local session data
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("loggedInUser");

      // Redirect to auth page based on folder depth
      const isSubfolder = location.pathname.includes("/employer/") || location.pathname.includes("/candidate/");
      window.location.href = isSubfolder ? "../auth.html" : "auth.html";
    } catch (error) {
      console.error("Auth: logout error", error);
    }
  },

  /**
   * Get current logged-in user from local storage
   */
  getCurrentUser() {
    try {
      const local = localStorage.getItem("currentUser");
      return local ? JSON.parse(local) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  /**
   * Update current user session data
   */
  updateSession(userData) {
    const current = this.getCurrentUser();
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem("currentUser", JSON.stringify(updated));
    }
  },

  /**
   * Check authentication and role requirements for a page
   * Redirects if requirements are not met
   */
  requireAuth(allowedRoles = null) {
    const user = this.getCurrentUser();
    const isSubfolder = location.pathname.includes("/employer/") || location.pathname.includes("/candidate/");
    const authPath = isSubfolder ? "../auth.html" : "auth.html";
    const indexPath = isSubfolder ? "../index.html" : "index.html";

    // Immediate hide to prevent flicker
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
      document.documentElement.style.display = "none";
    }

    if (!user) {
      window.location.href = authPath;
      return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      alert("Bạn không có quyền truy cập trang này!");
      window.location.href = indexPath;
      return null;
    }

    document.documentElement.style.display = "";
    return user;
  },
};

/**
 * Global listener for authentication state changes
 */
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      // Sync local session with Firestore on every auth state change
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        localStorage.setItem("currentUser", JSON.stringify(userDoc.data()));
      }
    } catch (error) {
      console.error("Auth: Sync error", error);
    }
  } else {
    // If not logged in on Firebase, clear local session
    localStorage.removeItem("currentUser");
  }
});
