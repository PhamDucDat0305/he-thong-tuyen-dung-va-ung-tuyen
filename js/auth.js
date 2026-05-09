/* ========== AUTHENTICATION ========== */

const Auth = {
  register(username, password, fullName, email, role) {
    if (!username || !password || !fullName || !email || !role) {
      return { success: false, message: "Vui lòng điền đầy đủ thông tin" };
    }
    if (password.length < 4) {
      return { success: false, message: "Mật khẩu phải có ít nhất 4 ký tự" };
    }
    if (DB.getUserByUsername(username)) {
      return { success: false, message: "Tên đăng nhập đã tồn tại" };
    }
    const user = DB.createUser({ username, password, fullName, email, role });
    // Auto create company profile for employer
    if (role === "employer") {
      DB.createCompany({
        employerId: user.id,
        name: fullName + " Company",
        description: "",
        industry: "",
        size: "",
        location: "",
        website: "",
        logo: "🏢",
      });
    }
    return { success: true, user };
  },

  login(username, password) {
    const user = DB.getUserByUsername(username);
    if (!user) return { success: false, message: "Tài khoản không tồn tại" };
    if (user.password !== password)
      return { success: false, message: "Mật khẩu không đúng" };
    if (user.status === "blocked")
      return { success: false, message: "Tài khoản đã bị khóa" };
    localStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, user };
  },

  logout() {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("loggedInUser");
    const authPath = location.pathname.includes('/employer/') ? '../auth.html' : 'auth.html';
    window.location.href = authPath;
  },

  getCurrentUser() {
    try {
      const local = localStorage.getItem("currentUser");
      const session = sessionStorage.getItem("loggedInUser");
      return JSON.parse(local || session) || null;
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
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Chưa đăng nhập" };
    if (user.password !== oldPwd)
      return { success: false, message: "Mật khẩu cũ không đúng" };
    if (newPwd.length < 4)
      return {
        success: false,
        message: "Mật khẩu mới phải có ít nhất 4 ký tự",
      };
    DB.updateUser(user.id, { password: newPwd });
    this.updateSession({ password: newPwd });
    return { success: true, message: "Đổi mật khẩu thành công" };
  },

  requireAuth(allowedRoles) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/') ? '../auth.html' : 'auth.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      alert("Bạn không có quyền truy cập trang này!");
      window.location.href = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/') ? '../index.html' : 'index.html';
      return null;
    }
    return user;
  },
};
