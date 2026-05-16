/* ========== AUTHENTICATION ========== */
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

window.Auth = {
  async register(username, password, fullName, email, role) {
    try {
      // 1. Tạo tài khoản trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // 2. Tạo dữ liệu người dùng để lưu lên Firestore
      const userData = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        username: username,
        email: email,
        fullName: fullName,
        role: role,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // 3. Ghi vào Collection "users" trên Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), userData);

      // Nếu là nhà tuyển dụng, tạo thêm document công ty rỗng
      if (role === "employer") {
        await setDoc(doc(db, "companies", firebaseUser.uid), {
          employerId: firebaseUser.uid,
          name: fullName + " Company",
          description: "",
          industry: "",
          size: "",
          location: "",
          website: "",
          logo: '<i class="fa-solid fa-building"></i>',
        });
      }

      // 4. Lưu tạm vào localStorage để giao diện (UI) nhận diện được người dùng
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      let msg = error.message;
      if (error.code === "auth/email-already-in-use")
        msg = "Email này đã được sử dụng.";
      if (error.code === "auth/weak-password")
        msg = "Mật khẩu quá yếu (cần ít nhất 6 ký tự).";
      return { success: false, message: msg };
    }
  },

  async login(email, password) {
    try {
      // 1. Đăng nhập qua Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // 2. Lấy thông tin chi tiết (vai trò, họ tên) từ Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        return {
          success: false,
          message: "Lỗi: Tài khoản có tồn tại nhưng mất dữ liệu phân quyền!",
        };
      }

      const userData = userDoc.data();

      // 3. Lưu tạm vào localStorage để các file giao diện (app.js) có thể đọc được
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      let msg = error.message;
      if (error.code === "auth/invalid-credential")
        msg = "Email hoặc mật khẩu không chính xác.";
      return { success: false, message: msg };
    }
  },

  async logout() {
    await signOut(auth);

    // Xóa session ở local
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("loggedInUser");

    const isSubfolder =
      location.pathname.includes("/employer/") ||
      location.pathname.includes("/candidate/");
    const authPath = isSubfolder ? "../auth.html" : "auth.html";

    window.location.href = authPath;
  },

  getCurrentUser() {
    try {
      const local = localStorage.getItem("currentUser");

      return JSON.parse(local) || null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  updateSession(userData) {
    const current = this.getCurrentUser();
    if (current) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ ...current, ...userData }),
      );
    }
  },

  changePassword(oldPwd, newPwd) {
    return { success: false, message: "Tính năng đang được nâng cấp." };
  },

  requireAuth(allowedRoles) {
    const user = this.getCurrentUser();
    const isSubfolder =
      location.pathname.includes("/employer/") ||
      location.pathname.includes("/candidate/");
    const authPath = isSubfolder ? "../auth.html" : "auth.html";
    const indexPath = isSubfolder ? "../index.html" : "index.html";

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
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userDoc.exists()) {
        localStorage.setItem("currentUser", JSON.stringify(userDoc.data()));
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    localStorage.removeItem("currentUser");
  }
});
