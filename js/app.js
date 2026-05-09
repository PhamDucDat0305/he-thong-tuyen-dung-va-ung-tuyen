/* ========== SHARED UTILITIES & NAVIGATION ========== */

const App = {
  /* === Navbar Renderer (Removed - Now handled by navbar.js) === */

  /* === Sidebar Renderer === */
  renderSidebar(role, activePage) {
    const user = Auth.getCurrentUser();
    const sidebar = document.getElementById("sidebar");
    if (!sidebar || !user) return;

    const initials = user.fullName
      ? user.fullName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
      : "U";
    const roleLabel = {
      admin: "Quản trị viên",
      employer: "Nhà tuyển dụng",
      candidate: "Ứng viên",
    };

    let menuHTML = "";
    if (role === "admin") {
      menuHTML = `
        <div class="menu-label">Tổng quan</div>
        <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}"><span class="icon">📊</span> Dashboard</a>
        <div class="menu-label">Quản lý</div>
        <a href="manage-users.html" class="${activePage === "users" ? "active" : ""}"><span class="icon">👥</span> Quản lý User</a>
        <a href="manage-jobs.html" class="${activePage === "jobs" ? "active" : ""}"><span class="icon">📄</span> Quản lý Job</a>
        <a href="reports.html" class="${activePage === "reports" ? "active" : ""}"><span class="icon">📈</span> Báo cáo</a>
        <div class="menu-label">Hệ thống</div>
        <a href="../index.html"><span class="icon">🌐</span> Xem trang web</a>
      `;
    } else if (role === "employer") {
      menuHTML = `
        <div class="menu-label">Tổng quan</div>
        <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}"><span class="icon">📊</span> Dashboard</a>

        <div class="menu-label">Quản lý tuyển dụng</div>
        <a href="post-job.html" class="${activePage === "post" ? "active" : ""}"><span class="icon">📝</span> Đăng tin tuyển dụng</a>
        <a href="my-jobs.html" class="${activePage === "myjobs" ? "active" : ""}"><span class="icon">📋</span> Danh sách tin tuyển dụng</a>

        <div class="menu-label">Quản lý ứng viên</div>
        <a href="#" class="${activePage === "applicants" ? "active" : ""}"><span class="icon">👥</span> Danh sách ứng viên</a>
        <a href="#" class="${activePage === "applied" ? "active" : ""}"><span class="icon">📥</span> Ứng viên đã ứng tuyển</a>
        <a href="#" class="${activePage === "saved_candidates" ? "active" : ""}"><span class="icon">📌</span> Ứng viên đã lưu</a>
        <a href="#" class="${activePage === "interviews" ? "active" : ""}"><span class="icon">📅</span> Lịch phỏng vấn</a>

        <div class="menu-label">Quản lý công ty</div>
        <a href="company-profile.html" class="${activePage === "company" ? "active" : ""}"><span class="icon">🏢</span> Hồ sơ công ty</a>
        <a href="edit-company.html" class="${activePage === "edit_company" ? "active" : ""}"><span class="icon">✏️</span> Chỉnh sửa thông tin công ty</a>

        <div class="menu-label">Báo cáo & thống kê</div>
        <a href="#" class="${activePage === "stats_views" ? "active" : ""}"><span class="icon">👁️</span> Lượt xem tin</a>
        <a href="#" class="${activePage === "stats_performance" ? "active" : ""}"><span class="icon">📊</span> Hiệu quả tuyển dụng</a>

        <div class="menu-label">Cá nhân & Bảo mật</div>
        <a href="#" class="${activePage === "account" ? "active" : ""}"><span class="icon">👤</span> Thông tin tài khoản</a>
        <a href="#" class="${activePage === "password" ? "active" : ""}"><span class="icon">🔑</span> Đổi mật khẩu</a>
        <a href="#" class="${activePage === "security" ? "active" : ""}"><span class="icon">🛡️</span> Cài đặt bảo mật</a>
      `;
    }

    sidebar.innerHTML = `
      <a href="../index.html" class="sidebar-brand" style="text-decoration: none;">
        <span class="logo-icon">💼</span>
        <span>JobViệt</span>
      </a>
      <div class="sidebar-menu">${menuHTML}</div>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${initials}</div>
          <div class="user-info">
            <div class="user-name">${user.fullName}</div>
            <div class="user-role">${roleLabel[user.role]}</div>
          </div>
          <button onclick="Auth.logout()" title="Đăng xuất" style="color:rgba(255,255,255,.5);font-size:1.1rem;cursor:pointer;background:none;border:none;">🚪</button>
        </div>
      </div>
    `;
  },

  /* === Footer Renderer === */
  renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    
    // Xử lý đường dẫn tương đối
    const isSubfolder = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/');
    const base = isSubfolder ? '../' : '';

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>💼 JobViệt</h4>
            <p>Nền tảng tuyển dụng và tìm việc hàng đầu Việt Nam. Kết nối nhà tuyển dụng với ứng viên tiềm năng một cách nhanh chóng và hiệu quả.</p>
          </div>
          <div>
            <h4>Ứng viên</h4>
            <ul>
              <li><a href="${base}job-list.html">Tìm việc làm</a></li>
              <li><a href="${base}auth.html">Việc đã ứng tuyển</a></li>
              <li><a href="${base}auth.html">Việc đã lưu</a></li>
              <li><a href="${base}auth.html">Hồ sơ cá nhân</a></li>
            </ul>
          </div>
          <div>
            <h4>Nhà tuyển dụng</h4>
            <ul>
              <li><a href="${base}employer/post-job.html">Đăng tuyển dụng</a></li>
              <li><a href="${base}employer/my-jobs.html">Quản lý tin</a></li>
              <li><a href="${base}employer/company-profile.html">Hồ sơ công ty</a></li>
            </ul>
          </div>
          <div>
            <h4>Liên kết</h4>
            <ul>
              <li><a href="${base}about.html">Giới thiệu</a></li>
              <li><a href="${base}contact.html">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          © 2026 JobViệt — Hệ thống tuyển dụng và tìm việc làm
        </div>
      </div>
    `;
  },

  /* === Pagination === */
  paginate(items, page = 1, perPage = 8) {
    const total = Math.ceil(items.length / perPage);
    const start = (page - 1) * perPage;
    return {
      data: items.slice(start, start + perPage),
      currentPage: page,
      totalPages: total,
      total: items.length,
    };
  },

  renderPagination(container, totalPages, currentPage, onPageChange) {
    if (totalPages <= 1) {
      container.innerHTML = "";
      return;
    }
    let html = `<button ${currentPage === 1 ? "disabled" : ""} onclick="(${onPageChange})(${currentPage - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (
        totalPages > 7 &&
        i > 3 &&
        i < totalPages - 2 &&
        Math.abs(i - currentPage) > 1
      ) {
        if (i === 4 || i === totalPages - 3)
          html += `<button disabled>…</button>`;
        continue;
      }
      html += `<button class="${i === currentPage ? "active" : ""}" onclick="(${onPageChange})(${i})">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? "disabled" : ""} onclick="(${onPageChange})(${currentPage + 1})">›</button>`;
    container.innerHTML = html;
  },

  /* === Search debounce === */
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  /* === Format helpers === */
  timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
  },

  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

};

// Tự động render Footer khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  App.renderFooter();
});
