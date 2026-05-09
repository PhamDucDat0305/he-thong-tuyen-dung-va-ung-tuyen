/**
 * navbar.js — JobViệt
 * Dynamic navbar with role-based dropdown menus
 * Roles: "candidate" | "employer"
 */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════ */

  function getUser() {
    try {
      const local = localStorage.getItem("currentUser");
      const session = sessionStorage.getItem("loggedInUser");
      return JSON.parse(local || session) || null;
    } catch {
      return null;
    }
  }

  function initials(name) {
    if (!name) return "?";
    const p = name.trim().split(/\s+/);
    return p.length === 1
      ? p[0][0].toUpperCase()
      : (p[0][0] + p[p.length - 1][0]).toUpperCase();
  }

  function resolveHref(path) {
    const inSubfolder = location.pathname.includes('/employer/') || location.pathname.includes('/candidate/');
    return inSubfolder ? '../' + path : path;
  }
  /* ══════════════════════════════════════════════════════════
     MENU DATA  — edit here to add / remove items
     ══════════════════════════════════════════════════════════ */

  const MENUS = {
    /* ── Candidate (Ứng viên) ─────────────────────────────── */
    candidate: [
      {
        label: "Tổng quan",
        items: [
          { icon: "fa-chart-pie", text: "Dashboard", href: resolveHref("candidate/dashboard.html") },
        ],
      },
      {
        label: "Quản lý tìm việc",
        items: [
          { icon: "fa-bookmark", text: "Việc làm đã lưu", href: resolveHref("candidate/saved-jobs.html") },
          { icon: "fa-paper-plane", text: "Việc làm đã ứng tuyển", href: resolveHref("candidate/my-applications.html") },
          { icon: "fa-circle-check", text: "Việc làm trúng tuyển", href: resolveHref("candidate/accepted-jobs.html") },
        ],
      },
      {
        label: "Quản lý CV & Cover letter",
        items: [
          { icon: "fa-file-lines", text: "CV của tôi", href: resolveHref("candidate/my-cv.html") },
          { icon: "fa-envelope-open-text", text: "Cover Letter của tôi", href: resolveHref("candidate/cover-letter.html") },
        ],
      },
      {
        label: "Tương tác với nhà tuyển dụng",
        items: [
          { icon: "fa-handshake", text: "Nhà tuyển dụng muốn kết nối", href: resolveHref("candidate/employer-invites.html") },
          { icon: "fa-eye", text: "Nhà tuyển dụng xem hồ sơ", href: resolveHref("candidate/profile-views.html") },
        ],
      },
      {
        label: "Cá nhân & Bảo mật",
        items: [
          { icon: "fa-user-pen", text: "Thông tin cá nhân", href: resolveHref("candidate/account.html") },
          { icon: "fa-shield-halved", text: "Cài đặt bảo mật", href: resolveHref("candidate/security.html") },
        ],
      },
    ],

    /* ── Employer (Nhà tuyển dụng) ────────────────────────── */
    employer: [
      {
        label: "Tổng quan",
        items: [
          {
            icon: "fa-chart-pie",
            text: "Dashboard",
            href: resolveHref("employer/dashboard.html"),
          },
        ],
      },
      {
        label: "Quản lý tuyển dụng",
        items: [
          {
            icon: "fa-pen-to-square",
            text: "Đăng tin tuyển dụng",
            href: resolveHref("employer/post-job.html"),
          },
          {
            icon: "fa-rectangle-list",
            text: "Danh sách tin tuyển dụng",
            href: resolveHref("employer/my-jobs.html"),
          },
        ],
      },
      {
        label: "Quản lý ứng viên",
        items: [
          { icon: "fa-users", text: "Danh sách ứng viên", href: resolveHref("employer/applicants.html") },
          { icon: "fa-user-check", text: "Ứng viên đã ứng tuyển", href: resolveHref("employer/applied-candidates.html") },
          { icon: "fa-calendar-check", text: "Lịch phỏng vấn", href: resolveHref("employer/interviews.html") },
          { icon: "fa-circle-check", text: "Ứng viên đã trúng tuyển", href: resolveHref("employer/accepted-candidates.html") },
          { icon: "fa-heart", text: "Ứng viên đã lưu", href: resolveHref("employer/saved-candidates.html") },
        ],
      },
      {
        label: "Quản lý công ty",
        items: [
          {
            icon: "fa-building",
            text: "Hồ sơ công ty",
            href: resolveHref("employer/company-profile.html"),
          },
          {
            icon: "fa-building-pen",
            text: "Chỉnh sửa thông tin công ty",
            href: resolveHref("employer/edit-company.html"),
          },
        ],
      },
      {
        label: "Báo cáo & thống kê",
        items: [
          { icon: "fa-chart-line", text: "Lượt xem tin", href: resolveHref("employer/stats-views.html") },
          { icon: "fa-chart-pie", text: "Hiệu quả tuyển dụng", href: resolveHref("employer/stats-performance.html") },
        ],
      },
      {
        label: "Cá nhân & Bảo mật",
        items: [
          { icon: "fa-id-card", text: "Thông tin tài khoản", href: resolveHref("employer/account.html") },
          { icon: "fa-key", text: "Đổi mật khẩu", href: resolveHref("employer/password.html") },
          { icon: "fa-shield-halved", text: "Cài đặt bảo mật", href: resolveHref("employer/security.html") },
        ],
      },
    ],
  };

  /* ══════════════════════════════════════════════════════════
     HTML BUILDERS
     ══════════════════════════════════════════════════════════ */

  /** Build all <div class="dd-section"> blocks from a menu array */
  function buildSections(sections) {
    return sections
      .map(
        (sec) => `
      <div class="dd-section">
        <div class="dd-section-label">${sec.label}</div>
        ${sec.items
          .map(
            (it) => `
          <a href="${it.href}" class="dd-item">
            <div class="dd-item-icon"><i class="fa-solid ${it.icon}"></i></div>
            <span class="dd-item-text">${it.text}</span>
          </a>`,
          )
          .join("")}
      </div>`,
      )
      .join("");
  }

  /** Full navbar HTML */
  function buildNavbar(user) {
    /* ── Nav links ── */
    const links = [
      { href: resolveHref("index.html"), label: "Trang chủ" },
      { href: resolveHref("job-list.html"), label: "Việc làm" },
      { href: resolveHref("about.html"), label: "Giới thiệu" },
      { href: resolveHref("contact.html"), label: "Liên hệ" },
    ];
    const cur = location.pathname.split("/").pop() || "index.html";
    const navLinksHTML = links
      .map(
        (l) =>
          `<a href="${l.href}" class="${cur === l.href ? "active" : ""}">${l.label}</a>`,
      )
      .join("");

    /* ── Logged-out buttons ── */
    const authHTML = `
      <div class="navbar-right" id="navAuthArea">
        <a href="${resolveHref("auth.html")}" class="nav-auth-btn nav-btn-login" id="navLoginBtn">
          <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
        </a>
        <a href="${resolveHref("auth.html?mode=register")}" class="nav-auth-btn nav-btn-register" id="navRegisterBtn">
          <i class="fa-solid fa-user-plus"></i> <span class="reg-text">Đăng ký</span>
        </a>
      </div>`;

    /* ── Logged-in profile + dropdown ── */
    const ui = initials(user ? user.fullName : "");
    const av = user?.avatar ? `<img src="${user.avatar}" alt="avatar">` : ui;
    const role = user?.role || "candidate";
    const roleLabel = role === "employer" ? "Nhà tuyển dụng" : "Ứng viên";
    const sections = MENUS[role] || MENUS.candidate;

    const profileHTML = `
      <div class="navbar-right" id="navAuthArea">
        <div class="nav-profile-wrapper is-logged-in" id="navProfileWrapper">

          <!-- Trigger -->
          <div class="nav-profile-trigger" id="navProfileTrigger">
            <div class="nav-avatar" id="navAvatar">${av}</div>
            <span class="nav-username" id="navUsername">${user?.username || ""}</span>
            <i class="fa-solid fa-chevron-down nav-chevron"></i>
          </div>

          <!-- Dropdown -->
          <div class="nav-dropdown" id="navDropdown">

            <!-- Header -->
            <div class="dd-header">
              <div class="dd-avatar" id="ddAvatar">${av}</div>
              <div class="dd-header-info">
                <div class="dd-name">${user?.fullName || user?.username || ""}</div>
                <div class="dd-role-badge dd-role-${role}">
                  <i class="fa-solid ${role === "employer" ? "fa-building" : "fa-user-graduate"}"></i>
                  ${roleLabel}
                </div>
                <div class="dd-verified">
                  <i class="fa-solid fa-circle-check"></i> Tài khoản đã xác thực
                </div>
              </div>
            </div>

            <!-- Role-based sections -->
            ${buildSections(sections)}

            <!-- Logout -->
            <div class="dd-footer">
              <button class="dd-logout" id="navLogoutBtn">
                <div class="dd-item-icon"><i class="fa-solid fa-arrow-right-from-bracket"></i></div>
                Đăng xuất
              </button>
            </div>

          </div><!-- /nav-dropdown -->
        </div><!-- /nav-profile-wrapper -->
      </div>`;

    return `
      <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
        <div class="navbar-inner">
          <a href="${resolveHref("index.html")}" class="navbar-logo" aria-label="JobViệt trang chủ">
            <i class="fa-solid fa-briefcase"></i> JobViệt
          </a>
          <div class="navbar-links" id="navLinks">
            ${navLinksHTML}
          </div>
          <button class="navbar-hamburger" id="navHamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          ${user ? profileHTML : authHTML}
        </div>
      </nav>`;
  }

  /* ══════════════════════════════════════════════════════════
     EVENT WIRING
     ══════════════════════════════════════════════════════════ */

  function wireEvents() {
    /* Scroll shadow */
    window.addEventListener(
      "scroll",
      () => {
        const nb = document.getElementById("navbar");
        if (nb) nb.classList.toggle("scrolled", window.scrollY > 10);
      },
      { passive: true },
    );

    /* Hover dropdown with delay — prevents flicker */
    const wrapper = document.getElementById("navProfileWrapper");
    const dropdown = document.getElementById("navDropdown");
    let hideTimer = null;

    if (wrapper && dropdown) {
      /* Desktop: hover */
      wrapper.addEventListener("mouseenter", () => {
        if (window.innerWidth > 768) {
          clearTimeout(hideTimer);
          dropdown.classList.add("is-open");
        }
      });
      wrapper.addEventListener("mouseleave", () => {
        if (window.innerWidth > 768) {
          hideTimer = setTimeout(() => {
            dropdown.classList.remove("is-open");
          }, 150);
        }
      });

      /* Mobile: toggle khi bấm vào trigger */
      const trigger = document.getElementById("navProfileTrigger");
      if (trigger) {
        trigger.addEventListener("click", (e) => {
          if (window.innerWidth <= 768) {
            e.stopPropagation();
            dropdown.classList.toggle("is-open");
          }
        });
      }

      /* Bấm ra ngoài để đóng */
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          dropdown.classList.remove("is-open");
        }
      });
      dropdown.addEventListener(
        "wheel",
        (e) => {
          const { scrollTop, scrollHeight, clientHeight } = dropdown;
          const atTop = scrollTop === 0 && e.deltaY < 0;
          const atBottom =
            scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
          if (atTop || atBottom) e.preventDefault();
        },
        { passive: false },
      );
    }

    /* Prevent page scroll when scrolling inside dropdown */

    /* Hamburger toggle */
    const hamburger = document.getElementById("navHamburger");
    const navLinksEl = document.getElementById("navLinks");
    if (hamburger && navLinksEl) {
      hamburger.addEventListener("click", () => {
        navLinksEl.classList.toggle("open");
      });
    }
    /* Logout — re-render in place */
    const logoutBtn = document.getElementById("navLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("loggedInUser");
        localStorage.removeItem("currentUser");
        
        const stayPages = ['contact.html', 'about.html', 'job-list.html'];
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        
        if (stayPages.includes(currentPage)) {
          // Stay and refresh navbar
          const oldNav = document.getElementById("navbar");
          if (oldNav) {
            const ph = document.createElement("div");
            ph.id = "navbar-placeholder";
            oldNav.replaceWith(ph);
            mount();
          }
        } else {
          // Redirect to home
          location.href = resolveHref('index.html');
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     MOUNT
     ══════════════════════════════════════════════════════════ */

  function mount() {
    const placeholder = document.getElementById("navbar-placeholder");
    if (!placeholder) return;

    const user = getUser();
    placeholder.outerHTML = buildNavbar(user);
    wireEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
