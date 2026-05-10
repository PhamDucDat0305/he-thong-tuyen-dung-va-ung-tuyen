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
  incrementJobViews(id) {
    const jobs = this.getJobs().map((j) =>
      j.id === id ? { ...j, views: (j.views || 0) + 1 } : j,
    );
    this._set("jobs", jobs);
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
      status: "applied", // Đã ứng tuyển (Applied)
      appliedAt: this._now(),
    };
    apps.push(app);
    this._set("applications", apps);
    return app;
  },
  updateApplication(id, data) {
    const apps = this.getApplications().map((a) =>
      a.id === id ? { ...a, ...data, updatedAt: this._now() } : a,
    );
    this._set("applications", apps);
    return apps.find((a) => a.id === id);
  },
  deleteApplication(id) {
    this._set(
      "applications",
      this.getApplications().filter((a) => a.id !== id),
    );
    // Also delete interview if any
    const interviews = this._get("interviews").filter(
      (i) => i.applicationId !== id,
    );
    this._set("interviews", interviews);
  },

  /* === INTERVIEWS === */
  getInterviews() {
    return this._get("interviews");
  },
  getInterviewByApplication(appId) {
    return this.getInterviews().find((i) => i.applicationId === appId);
  },
  scheduleInterview(appId, data) {
    const interviews = this.getInterviews();
    const interview = {
      id: this._id(),
      applicationId: appId,
      ...data,
      createdAt: this._now(),
    };
    interviews.push(interview);
    this._set("interviews", interviews);

    // Update application status
    this.updateApplication(appId, { status: "interview_scheduled" });
    return interview;
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

  /* === MESSAGES === */
  getMessages(userId, contactId) {
    return this._get("messages").filter(
      (m) =>
        (m.senderId === userId && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === userId),
    );
  },
  sendMessage(senderId, receiverId, content) {
    const messages = this._get("messages");
    const msg = {
      id: this._id(),
      senderId,
      receiverId,
      content,
      timestamp: this._now(),
      read: false,
    };
    messages.push(msg);
    this._set("messages", messages);
    return msg;
  },
  getConversations(userId) {
    const messages = this._get("messages");
    const contacts = new Set();
    messages.forEach((m) => {
      if (m.senderId === userId) contacts.add(m.receiverId);
      if (m.receiverId === userId) contacts.add(m.senderId);
    });

    return Array.from(contacts).map((cId) => {
      const contact = this.getUserById(cId);
      const lastMsg = messages
        .filter(
          (m) =>
            (m.senderId === userId && m.receiverId === cId) ||
            (m.senderId === cId && m.receiverId === userId),
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      return {
        contact,
        lastMessage: lastMsg,
        unreadCount: messages.filter(
          (m) => m.senderId === cId && m.receiverId === userId && !m.read,
        ).length,
      };
    });
  },
  markAsRead(userId, contactId) {
    const messages = this._get("messages").map((m) =>
      m.senderId === contactId && m.receiverId === userId
        ? { ...m, read: true }
        : m,
    );
    this._set("messages", messages);
  },

  /* === SEED DATA === */
  seed() {
    if (localStorage.getItem("db_seeded_clean")) return;

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
      title: "Senior Frontend Developer",
      experience: "5 năm",
      location: "Hà Nội",
      skills: ["React", "Vue", "TypeScript", "TailwindCSS"],
      createdAt: this._now(),
      status: "active",
    };
    const cand2 = {
      id: "cand02",
      username: "hoangnam",
      password: "123456",
      fullName: "Nguyễn Hoàng Nam",
      email: "nam@gmail.com",
      role: "candidate",
      phone: "0945678901",
      title: "Backend Developer",
      experience: "3 năm",
      location: "TP. Hồ Chí Minh",
      skills: ["Node.js", "MongoDB", "Docker", "AWS"],
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
        logo: '<i class="fa-solid fa-building"></i>',
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
        logo: '<i class="fa-solid fa-industry"></i>',
        createdAt: this._now(),
      },
    ]);

    // Empty Jobs, Applications, Saved Jobs
    this._set("jobs", []);
    this._set("applications", []);
    this._set("savedJobs", []);
    this._set("interviews", []);

    localStorage.setItem("db_seeded_clean", "true");
  },
};

// Auto seed
DB.seed();
