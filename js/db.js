/* ========== DATABASE LAYER (localStorage) ========== */

const DB = {
  /* === Helpers === */
  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  _id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },
  _now() {
    return new Date().toISOString();
  },

  /* === USERS === */
  getUsers() {
    return this._get("users");
  },
  getUserById(id) {
    return this.getUsers().find((u) => u.id === id);
  },
  getUserByUsername(username) {
    return this.getUsers().find((u) => u.username === username);
  },
  createUser(data) {
    const users = this.getUsers();
    const user = {
      id: this._id(),
      ...data,
      createdAt: this._now(),
      status: "active",
    };
    users.push(user);
    this._set("users", users);
    return user;
  },
  updateUser(id, data) {
    const users = this.getUsers().map((u) =>
      u.id === id ? { ...u, ...data, updatedAt: this._now() } : u,
    );
    this._set("users", users);
    return users.find((u) => u.id === id);
  },
  deleteUser(id) {
    this._set(
      "users",
      this.getUsers().filter((u) => u.id !== id),
    );
  },

  /* === JOBS === */
  getJobs() {
    return this._get("jobs");
  },
  getJobById(id) {
    return this.getJobs().find((j) => j.id === id);
  },
  getJobsByEmployer(employerId) {
    return this.getJobs().filter((j) => j.createdBy === employerId);
  },
  createJob(data) {
    const jobs = this.getJobs();
    const job = {
      id: this._id(),
      ...data,
      createdAt: this._now(),
      status: "active",
      views: 0,
    };
    jobs.push(job);
    this._set("jobs", jobs);
    return job;
  },
  updateJob(id, data) {
    const jobs = this.getJobs().map((j) =>
      j.id === id ? { ...j, ...data, updatedAt: this._now() } : j,
    );
    this._set("jobs", jobs);
    return jobs.find((j) => j.id === id);
  },
  deleteJob(id) {
    this._set(
      "jobs",
      this.getJobs().filter((j) => j.id !== id),
    );
    // Also delete related applications
    this._set(
      "applications",
      this.getApplications().filter((a) => a.jobId !== id),
    );
  },

  /* === APPLICATIONS === */
  getApplications() {
    return this._get("applications");
  },
  getApplicationById(id) {
    return this.getApplications().find((a) => a.id === id);
  },
  getApplicationsByJob(jobId) {
    return this.getApplications().filter((a) => a.jobId === jobId);
  },
  getApplicationsByCandidate(candidateId) {
    return this.getApplications().filter((a) => a.candidateId === candidateId);
  },
  hasApplied(jobId, candidateId) {
    return this.getApplications().some(
      (a) => a.jobId === jobId && a.candidateId === candidateId,
    );
  },
  createApplication(data) {
    const apps = this.getApplications();
    const app = {
      id: this._id(),
      ...data,
      status: "pending",
      appliedAt: this._now(),
    };
    apps.push(app);
    this._set("applications", apps);
    return app;
  },
  updateApplication(id, data) {
    const apps = this.getApplications().map((a) =>
      a.id === id ? { ...a, ...data } : a,
    );
    this._set("applications", apps);
    return apps.find((a) => a.id === id);
  },

  /* === SAVED JOBS === */
  getSavedJobs(userId) {
    return this._get("savedJobs").filter((s) => s.userId === userId);
  },
  isJobSaved(userId, jobId) {
    return this._get("savedJobs").some(
      (s) => s.userId === userId && s.jobId === jobId,
    );
  },
  toggleSaveJob(userId, jobId) {
    const saved = this._get("savedJobs");
    const idx = saved.findIndex(
      (s) => s.userId === userId && s.jobId === jobId,
    );
    if (idx > -1) {
      saved.splice(idx, 1);
      this._set("savedJobs", saved);
      return false;
    } else {
      saved.push({ userId, jobId, savedAt: this._now() });
      this._set("savedJobs", saved);
      return true;
    }
  },

  /* === COMPANIES === */
  getCompanies() {
    return this._get("companies");
  },
  getCompanyByEmployer(employerId) {
    return this.getCompanies().find((c) => c.employerId === employerId);
  },
  createCompany(data) {
    const companies = this.getCompanies();
    const company = { id: this._id(), ...data, createdAt: this._now() };
    companies.push(company);
    this._set("companies", companies);
    return company;
  },
  updateCompany(employerId, data) {
    let companies = this.getCompanies();
    const idx = companies.findIndex((c) => c.employerId === employerId);
    if (idx > -1) {
      companies[idx] = { ...companies[idx], ...data, updatedAt: this._now() };
    }
    this._set("companies", companies);
    return companies[idx];
  },

  /* === SEED DATA === */
  seed() {
    if (localStorage.getItem("db_seeded")) return;

    // Users
    const admin = {
      id: "admin01",
      username: "admin",
      password: "admin123",
      fullName: "Quản Trị Viên",
      email: "admin@jobviet.vn",
      role: "admin",
      phone: "0901234567",
      createdAt: this._now(),
      status: "active",
    };
    const emp1 = {
      id: "emp01",
      username: "fpt",
      password: "123456",
      fullName: "Nguyễn Văn An",
      email: "tuyen@fpt.vn",
      role: "employer",
      phone: "0912345678",
      createdAt: this._now(),
      status: "active",
    };
    const emp2 = {
      id: "emp02",
      username: "vingroup",
      password: "123456",
      fullName: "Trần Minh Tú",
      email: "hr@vingroup.net",
      role: "employer",
      phone: "0923456789",
      createdAt: this._now(),
      status: "active",
    };
    const cand1 = {
      id: "cand01",
      username: "ungvien",
      password: "123456",
      fullName: "Lê Thị Hoa",
      email: "hoa@gmail.com",
      role: "candidate",
      phone: "0934567890",
      createdAt: this._now(),
      status: "active",
    };
    const cand2 = {
      id: "cand02",
      username: "minhtri",
      password: "123456",
      fullName: "Phạm Minh Trí",
      email: "tri@gmail.com",
      role: "candidate",
      phone: "0945678901",
      createdAt: this._now(),
      status: "active",
    };
    this._set("users", [admin, emp1, emp2, cand1, cand2]);

    // Companies
    this._set("companies", [
      {
        id: "comp01",
        employerId: "emp01",
        name: "FPT Software",
        description:
          "Công ty công nghệ hàng đầu Việt Nam chuyên cung cấp dịch vụ phần mềm, chuyển đổi số toàn cầu.",
        industry: "Công nghệ thông tin",
        size: "10000+",
        location: "Hà Nội",
        website: "https://fpt.vn",
        logo: "🏢",
        createdAt: this._now(),
      },
      {
        id: "comp02",
        employerId: "emp02",
        name: "Vingroup",
        description:
          "Tập đoàn kinh tế tư nhân lớn nhất Việt Nam hoạt động trong lĩnh vực công nghệ, bất động sản, du lịch.",
        industry: "Đa ngành",
        size: "5000+",
        location: "TP. Hồ Chí Minh",
        website: "https://vingroup.net",
        logo: "🏗️",
        createdAt: this._now(),
      },
    ]);

    // Jobs
    const jobs = [
      {
        id: "job01",
        title: "Lập Trình Viên Frontend (React)",
        companyName: "FPT Software",
        salary: "20-35 triệu",
        location: "Hà Nội",
        type: "full-time",
        experience: "1-3 năm",
        category: "Công nghệ",
        description:
          "Phát triển giao diện web sử dụng React.js, TypeScript. Làm việc với đội ngũ Agile để xây dựng các sản phẩm chuyển đổi số.",
        requirements:
          "Thành thạo React.js, HTML/CSS/JS\nHiểu biết về RESTful API\nKinh nghiệm Git, CI/CD\nTiếng Anh giao tiếp",
        benefits:
          "Lương tháng 13-14\nBảo hiểm sức khỏe\nĐào tạo nâng cao\nLàm việc hybrid",
        createdBy: "emp01",
        createdAt: "2026-03-20T08:00:00Z",
        status: "active",
        views: 156,
      },
      {
        id: "job02",
        title: "Kỹ Sư Backend (Java Spring Boot)",
        companyName: "FPT Software",
        salary: "25-40 triệu",
        location: "Đà Nẵng",
        type: "full-time",
        experience: "2-5 năm",
        category: "Công nghệ",
        description:
          "Thiết kế và phát triển hệ thống backend với Java Spring Boot, microservices. Tối ưu hiệu suất và bảo mật.",
        requirements:
          "Java, Spring Boot, Microservices\nMySQL/PostgreSQL\nDocker, Kubernetes\nKinh nghiệm thiết kế API",
        benefits:
          "Package lương hấp dẫn\nThưởng dự án\nDu lịch hàng năm\nPhòng gym miễn phí",
        createdBy: "emp01",
        createdAt: "2026-03-22T10:00:00Z",
        status: "active",
        views: 203,
      },
      {
        id: "job03",
        title: "Nhân Viên Marketing Digital",
        companyName: "Vingroup",
        salary: "15-25 triệu",
        location: "TP. Hồ Chí Minh",
        type: "full-time",
        experience: "1-3 năm",
        category: "Marketing",
        description:
          "Quản lý chiến dịch marketing online, SEO/SEM, social media. Phân tích dữ liệu và tối ưu chuyển đổi.",
        requirements:
          "Kinh nghiệm Facebook Ads, Google Ads\nKỹ năng phân tích dữ liệu\nSáng tạo nội dung\nTiếng Anh tốt",
        benefits:
          "Lương cạnh tranh\nMôi trường năng động\nCơ hội thăng tiến\nTeambuilding thường xuyên",
        createdBy: "emp02",
        createdAt: "2026-03-25T09:00:00Z",
        status: "active",
        views: 89,
      },
      {
        id: "job04",
        title: "Thiết Kế UI/UX Designer",
        companyName: "FPT Software",
        salary: "18-30 triệu",
        location: "Hà Nội",
        type: "full-time",
        experience: "1-3 năm",
        category: "Thiết kế",
        description:
          "Thiết kế giao diện người dùng cho ứng dụng web và mobile. Nghiên cứu UX, tạo wireframe và prototype.",
        requirements:
          "Thành thạo Figma, Adobe XD\nHiểu biết Design System\nKỹ năng wireframing\nPortfolio ấn tượng",
        benefits:
          "Sáng tạo không giới hạn\nĐào tạo design thinking\nLàm việc linh hoạt\nMáy Mac cấp sẵn",
        createdBy: "emp01",
        createdAt: "2026-03-28T07:00:00Z",
        status: "active",
        views: 124,
      },
      {
        id: "job05",
        title: "Trợ Lý Giám Đốc",
        companyName: "Vingroup",
        salary: "12-18 triệu",
        location: "TP. Hồ Chí Minh",
        type: "full-time",
        experience: "0-1 năm",
        category: "Hành chính",
        description:
          "Hỗ trợ giám đốc trong công việc hàng ngày, quản lý lịch họp, soạn thảo văn bản, điều phối công việc.",
        requirements:
          "Tốt nghiệp ĐH chuyên ngành liên quan\nKỹ năng giao tiếp tốt\nThành thạo MS Office\nCẩn thận, chủ động",
        benefits:
          "Học hỏi từ lãnh đạo cấp cao\nMôi trường chuyên nghiệp\nPhụ cấp ăn trưa\nBảo hiểm cao cấp",
        createdBy: "emp02",
        createdAt: "2026-04-01T06:00:00Z",
        status: "active",
        views: 67,
      },
      {
        id: "job06",
        title: "Data Analyst (Phân tích dữ liệu)",
        companyName: "FPT Software",
        salary: "22-35 triệu",
        location: "Hà Nội",
        type: "full-time",
        experience: "2-5 năm",
        category: "Công nghệ",
        description:
          "Phân tích dữ liệu kinh doanh, xây dựng báo cáo và dashboard. Hỗ trợ ra quyết định dựa trên dữ liệu.",
        requirements:
          "SQL, Python hoặc R\nPower BI / Tableau\nKỹ năng thống kê\nKinh nghiệm ETL",
        benefits:
          "Dự án đa dạng\nĐào tạo chứng chỉ\nLương review 2 lần/năm\nWork from home 2 ngày/tuần",
        createdBy: "emp01",
        createdAt: "2026-04-03T08:00:00Z",
        status: "active",
        views: 95,
      },
      {
        id: "job07",
        title: "Nhân Viên Kinh Doanh B2B",
        companyName: "Vingroup",
        salary: "10-20 triệu + hoa hồng",
        location: "Hà Nội",
        type: "full-time",
        experience: "0-1 năm",
        category: "Kinh doanh",
        description:
          "Tìm kiếm và phát triển khách hàng doanh nghiệp. Tư vấn giải pháp và chốt hợp đồng.",
        requirements:
          "Kỹ năng giao tiếp xuất sắc\nChịu được áp lực\nCó xe máy và GPLX\nƯu tiên có kinh nghiệm",
        benefits:
          "Hoa hồng hấp dẫn\nThưởng KPI\nĐào tạo bài bản\nCơ hội thăng tiến nhanh",
        createdBy: "emp02",
        createdAt: "2026-04-05T10:00:00Z",
        status: "active",
        views: 43,
      },
      {
        id: "job08",
        title: "Thực Tập Sinh Lập Trình",
        companyName: "FPT Software",
        salary: "5-8 triệu",
        location: "Đà Nẵng",
        type: "part-time",
        experience: "0-1 năm",
        category: "Công nghệ",
        description:
          "Chương trình thực tập 3-6 tháng cho sinh viên năm cuối. Được mentoring bởi senior developer.",
        requirements:
          "Sinh viên năm 3-4 CNTT\nBiết cơ bản HTML/CSS/JS\nHam học hỏi\nCó thể làm 4-5 ngày/tuần",
        benefits:
          "Trợ cấp thực tập\nCơ hội nhận việc chính thức\nMentor 1-1\nChứng nhận thực tập",
        createdBy: "emp01",
        createdAt: "2026-04-07T09:00:00Z",
        status: "active",
        views: 210,
      },
    ];
    this._set("jobs", jobs);

    // Applications
    this._set("applications", [
      {
        id: "app01",
        jobId: "job01",
        candidateId: "cand01",
        fullName: "Lê Thị Hoa",
        email: "hoa@gmail.com",
        cv: "Tôi có 2 năm kinh nghiệm làm việc với React.js tại công ty ABC. Thành thạo TypeScript, Redux, và TailwindCSS.",
        status: "pending",
        appliedAt: "2026-04-01T10:00:00Z",
      },
      {
        id: "app02",
        jobId: "job03",
        candidateId: "cand01",
        fullName: "Lê Thị Hoa",
        email: "hoa@gmail.com",
        cv: "Tôi đam mê marketing digital với kinh nghiệm quản lý fanpage 50K followers và chạy ads Facebook.",
        status: "accepted",
        appliedAt: "2026-04-02T14:00:00Z",
      },
      {
        id: "app03",
        jobId: "job01",
        candidateId: "cand02",
        fullName: "Phạm Minh Trí",
        email: "tri@gmail.com",
        cv: "Fresh graduate với dự án portfolio ấn tượng. Giỏi React, Next.js. Đạt giải nhì cuộc thi lập trình cấp trường.",
        status: "pending",
        appliedAt: "2026-04-03T08:30:00Z",
      },
      {
        id: "app04",
        jobId: "job08",
        candidateId: "cand02",
        fullName: "Phạm Minh Trí",
        email: "tri@gmail.com",
        cv: "Sinh viên năm 4 ĐH Bách Khoa, GPA 3.5/4. Biết HTML/CSS/JS, đang học React. Mong muốn được thực tập.",
        status: "pending",
        appliedAt: "2026-04-06T11:00:00Z",
      },
    ]);

    // Saved jobs
    this._set("savedJobs", [
      { userId: "cand01", jobId: "job04", savedAt: this._now() },
      { userId: "cand01", jobId: "job06", savedAt: this._now() },
    ]);

    localStorage.setItem("db_seeded", "true");
  },
};

// Auto seed
DB.seed();
