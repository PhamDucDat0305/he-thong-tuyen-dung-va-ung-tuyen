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
        <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-chart-simple text-primary"></i></span> Dashboard</a>
        <div class="menu-label">Quản lý</div>
        <a href="manage-users.html" class="${activePage === "users" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-users text-info"></i></span> Quản lý User</a>
        <a href="manage-jobs.html" class="${activePage === "jobs" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-file-lines text-success"></i></span> Quản lý Job</a>
        <a href="reports.html" class="${activePage === "reports" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-chart-line text-warning"></i></span> Báo cáo</a>
        <div class="menu-label">Hệ thống</div>
        <a href="../index.html"><span class="icon"><i class="fa-solid fa-globe text-indigo"></i></span> Xem trang web</a>
      `;
    } else if (role === "employer") {
      menuHTML = `
        <div class="menu-label">Tổng quan</div>
        <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-chart-simple text-primary"></i></span> Dashboard</a>

        <div class="menu-label">Quản lý tuyển dụng</div>
        <a href="post-job.html" class="${activePage === "post" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-pen-to-square text-success"></i></span> Đăng tin tuyển dụng</a>
        <a href="my-jobs.html" class="${activePage === "myjobs" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-rectangle-list text-info"></i></span> Danh sách tin tuyển dụng</a>

        <div class="menu-label">Quản lý ứng viên</div>
        <a href="applicants.html" class="${activePage === "applicants" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-users text-purple"></i></span> Danh sách ứng viên</a>
        <a href="applied-candidates.html" class="${activePage === "applied" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-inbox text-orange"></i></span> Ứng viên đã ứng tuyển</a>
        <a href="interviews.html" class="${activePage === "interviews" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-calendar-days text-indigo"></i></span> Lịch phỏng vấn</a>
        <a href="accepted-candidates.html" class="${activePage === "accepted" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-circle-check text-success"></i></span> Ứng viên đã trúng tuyển</a>
        <a href="saved-candidates.html" class="${activePage === "saved_candidates" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-thumbtack text-pink"></i></span> Ứng viên đã lưu</a>

        <div class="menu-label">Quản lý công ty</div>
        <a href="company-profile.html" class="${activePage === "company" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-building text-teal"></i></span> Hồ sơ công ty</a>
        <a href="edit-company.html" class="${activePage === "edit_company" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-pen-to-square text-primary"></i></span> Chỉnh sửa thông tin công ty</a>

        <div class="menu-label">Báo cáo & thống kê</div>
        <a href="stats-views.html" class="${activePage === "stats_views" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-eye text-warning"></i></span> Lượt xem tin</a>
        <a href="stats-performance.html" class="${activePage === "stats_performance" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-chart-simple text-success"></i></span> Hiệu quả tuyển dụng</a>

        <div class="menu-label">Cá nhân & Bảo mật</div>
        <a href="account.html" class="${activePage === "account" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-user text-primary"></i></span> Thông tin tài khoản</a>
        <a href="password.html" class="${activePage === "password" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-key text-warning"></i></span> Đổi mật khẩu</a>
        <a href="security.html" class="${activePage === "security" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-shield-halved text-danger"></i></span> Cài đặt bảo mật</a>
      `;
    } else if (role === "candidate") {
      menuHTML = `
        <div class="menu-label">Tổng quan</div>
        <a href="dashboard.html" class="${activePage === "dashboard" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-chart-simple text-primary"></i></span> Dashboard</a>

        <div class="menu-label">Quản lý tìm việc</div>
        <a href="saved-jobs.html" class="${activePage === "saved_jobs" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-bookmark text-pink"></i></span> Việc làm đã lưu</a>
        <a href="my-applications.html" class="${activePage === "my_apps" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-envelope-open-text text-orange"></i></span> Việc làm đã ứng tuyển</a>
        <a href="accepted-jobs.html" class="${activePage === "accepted" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-circle-check text-success"></i></span> Việc làm trúng tuyển</a>

        <div class="menu-label">Quản lý CV & Cover Letter</div>
        <a href="my-cv.html" class="${activePage === "my_cv" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-file-lines text-success"></i></span> CV của tôi</a>
        <a href="cover-letter.html" class="${activePage === "cover_letter" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-envelope text-info"></i></span> Cover Letter của tôi</a>

        <div class="menu-label">Tương tác nhà tuyển dụng</div>
        <a href="employer-invites.html" class="${activePage === "invites" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-handshake text-indigo"></i></span> Nhà tuyển dụng muốn kết nối</a>
        <a href="profile-views.html" class="${activePage === "profile_views" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-eye text-warning"></i></span> Nhà tuyển dụng xem hồ sơ</a>

        <div class="menu-label">Cá nhân & Bảo mật</div>
        <a href="account.html" class="${activePage === "account" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-user text-primary"></i></span> Thông tin cá nhân</a>
        <a href="security.html" class="${activePage === "security" ? "active" : ""}"><span class="icon"><i class="fa-solid fa-shield-halved text-danger"></i></span> Cài đặt bảo mật</a>
      `;
    }

    sidebar.innerHTML = `
      <div class="sidebar-header-mobile">
        <div style="flex: 1"></div>
        <button class="btn-close-sidebar" onclick="App.toggleSidebar()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="sidebar-menu">${menuHTML}</div>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="avatar">${initials}</div>
          <div class="user-info">
            <div class="user-name">${user.fullName}</div>
            <div class="user-role">${roleLabel[user.role]}</div>
          </div>
          <button onclick="Auth.logout()" title="Đăng xuất" style="color:var(--text-light);font-size:1.1rem;cursor:pointer;background:none;border:none;"><i class="fa-solid fa-right-from-bracket"></i></button>
        </div>
      </div>
    `;

    // Add overlay if it doesn't exist
    if (!document.getElementById('sidebarOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebarOverlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = () => App.toggleSidebar();
      document.body.appendChild(overlay);
    }

    // Ensure toggle button exists in content area
    this.ensureSidebarToggle();
  },

  ensureSidebarToggle() {
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
      let topBar = document.getElementById('dashboardTopBar');
      if (!topBar) {
        topBar = document.createElement('div');
        topBar.id = 'dashboardTopBar';
        topBar.className = 'dashboard-top-bar';
        contentArea.prepend(topBar);
      }

      if (!document.getElementById('sidebarToggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'sidebarToggle';
        toggleBtn.className = 'btn btn-icon btn-secondary sidebar-toggle-btn';
        toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        toggleBtn.onclick = () => App.toggleSidebar();
        topBar.prepend(toggleBtn);
      }
    }
  },

  renderFeaturedJobs() {
    const container = document.getElementById("featuredJobs");
    if (!container) return;

    if (typeof DB === 'undefined') return;
    let jobs = DB.getJobs().filter(job => job.status === "active");
    
    // Nếu là candidate, ẩn các việc đã ứng tuyển
    const currentUser = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
    if (currentUser && currentUser.role === 'candidate') {
      jobs = jobs.filter(j => !DB.hasApplied(j.id, currentUser.id));
    }
    
    jobs = jobs.reverse();

    container.innerHTML = jobs.map(job => `
      <div class="job-card animate-fade-up">
        <div class="job-title" style="font-size:1.2rem; font-weight:700; color:var(--text); margin-bottom:8px">${job.title}</div>
        <div class="job-company" style="color:var(--primary); font-weight:600; margin-bottom:12px">${job.companyName}</div>
        <div class="job-meta" style="display:flex; gap:16px; font-size:0.9rem; color:var(--text-light); margin-bottom:16px">
          <span><i class="fa-solid fa-location-dot text-danger"></i> ${job.location}</span>
          <span><i class="fa-solid fa-money-bill-wave text-success"></i> ${job.salary}</span>
        </div>
        <div class="job-actions">
          <button onclick="App.viewJob('${job.id}')" class="btn btn-sm btn-primary">Xem chi tiết</button>
        </div>
      </div>
    `).join("");
  },

  viewJob(id) {
    const inSubfolder = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/');
    window.location.href = (inSubfolder ? '../' : '') + 'job-detail.html?id=' + id;
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
  },

  /* === Footer Renderer === */
  renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;
    
    // Xử lý đường dẫn tương đối
    const isSubfolder = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/');
    const base = isSubfolder ? '../' : '';
    const user = Auth.getCurrentUser();

    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4><i class="fa-solid fa-briefcase"></i> JobViệt</h4>
            <p>Nền tảng tuyển dụng và tìm việc hàng đầu Việt Nam. Kết nối nhà tuyển dụng với ứng viên tiềm năng một cách nhanh chóng và hiệu quả.</p>
          </div>
          <div>
            <h4>Ứng viên</h4>
            <ul>
              <li><a href="${base}job-list.html">Tìm việc làm</a></li>
              <li><a href="#" onclick="App.protectedNav(event, '${base}candidate/my-applications.html', 'candidate')">Việc đã ứng tuyển</a></li>
              <li><a href="#" onclick="App.protectedNav(event, '${base}candidate/saved-jobs.html', 'candidate')">Việc đã lưu</a></li>
              <li><a href="#" onclick="App.protectedNav(event, '${base}candidate/account.html', 'candidate')">Hồ sơ cá nhân</a></li>
            </ul>
          </div>
          <div>
            <h4><a href="#" onclick="App.protectedNav(event, '${base}employer/dashboard.html', 'employer')" style="color: inherit; text-decoration: none;">Nhà tuyển dụng</a></h4>
            <ul>
              <li><a href="#" onclick="App.protectedNav(event, '${base}employer/post-job.html', 'employer')">Đăng tuyển dụng</a></li>
              <li><a href="#" onclick="App.protectedNav(event, '${base}employer/my-jobs.html', 'employer')">Quản lý tin</a></li>
              <li><a href="#" onclick="App.protectedNav(event, '${base}employer/company-profile.html', 'employer')">Hồ sơ công ty</a></li>
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

  /* === Protected Navigation === */
  protectedNav(e, url, role) {
    if (e) e.preventDefault();
    const user = Auth.getCurrentUser();
    const isSubfolder = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/');
    const authPath = isSubfolder ? '../auth.html' : 'auth.html';
    const indexPath = isSubfolder ? '../index.html' : 'index.html';

    if (!user) {
      window.location.href = authPath;
      return;
    }

    if (role && user.role !== role) {
      alert(user.role === 'candidate' ? 'Trang này dành cho Nhà tuyển dụng!' : 'Trang này dành cho Ứng viên!');
      window.location.href = indexPath;
      return;
    }

    window.location.href = url;
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
