/* ========== DATABASE LAYER (Firebase + localStorage) ========== */
import { db } from "./firebase-config.js";
window.USE_FIREBASE = true;
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

window.DB = {
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

  /* === USERS (FIRESTORE) === */
  async getUserById(id) {
    const d = await getDoc(doc(db, "users", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },

  /* === JOBS (FIRESTORE) === */
  async getJobs() {
    const q = collection(db, "jobs");
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getJobById(id) {
    const d = await getDoc(doc(db, "jobs", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async getJobsByEmployer(employerId) {
    const q = query(collection(db, "jobs"), where("createdBy", "==", employerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async createJob(data) {
    const jobData = {
      ...data,
      createdAt: this._now(),
      status: "active",
      views: 0,
    };
    const docRef = await addDoc(collection(db, "jobs"), jobData);
    return { id: docRef.id, ...jobData };
  },
  async updateJob(id, data) {
    const dataToUpdate = { ...data, updatedAt: this._now() };
    await updateDoc(doc(db, "jobs", id), dataToUpdate);
    return await this.getJobById(id);
  },
  async deleteJob(id) {
    await deleteDoc(doc(db, "jobs", id));
  },
  async incrementJobViews(id) {
    const job = await this.getJobById(id);
    if (job) {
      await updateDoc(doc(db, "jobs", id), { views: (job.views || 0) + 1 });
    }
  },

  /* === APPLICATIONS (FIRESTORE) === */
  async getApplications() {
    const q = collection(db, "applications");
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getApplicationById(id) {
    const d = await getDoc(doc(db, "applications", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async getApplicationsByJob(jobId) {
    const q = query(collection(db, "applications"), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getApplicationsByCandidate(candidateId) {
    const q = query(collection(db, "applications"), where("candidateId", "==", candidateId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async hasApplied(jobId, candidateId) {
    const q = query(collection(db, "applications"), where("jobId", "==", jobId), where("candidateId", "==", candidateId));
    const snap = await getDocs(q);
    return !snap.empty;
  },
  async createApplication(data) {
    const appData = {
      ...data,
      status: "applied",
      appliedAt: this._now(),
      updatedAt: this._now()
    };
    const docRef = await addDoc(collection(db, "applications"), appData);
    return { id: docRef.id, ...appData };
  },
  async updateApplication(id, data) {
    const dataToUpdate = { ...data, updatedAt: this._now() };
    await updateDoc(doc(db, "applications", id), dataToUpdate);
    return await this.getApplicationById(id);
  },
  async deleteApplication(id) {
    await deleteDoc(doc(db, "applications", id));
  },

  /* === INTERVIEWS (FIRESTORE) === */
  async getInterviews() {
    const q = collection(db, "interviews");
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  async getInterviewByApplication(appId) {
    const q = query(collection(db, "interviews"), where("applicationId", "==", appId));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },
  async scheduleInterview(appId, data) {
    const interviewData = {
      applicationId: appId,
      ...data,
      createdAt: this._now(),
    };
    const docRef = await addDoc(collection(db, "interviews"), interviewData);
    await this.updateApplication(appId, { status: "interview_scheduled" });
    return { id: docRef.id, ...interviewData };
  },

  /* === SAVED JOBS (LOCAL) === */
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

  /* === COMPANIES (FIRESTORE) === */
  async getCompanyByEmployer(employerId) {
    const d = await getDoc(doc(db, "companies", employerId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async createCompany(employerId, data) {
    await setDoc(doc(db, "companies", employerId), {
      employerId,
      ...data,
      createdAt: this._now()
    });
  },
  async updateCompany(employerId, data) {
    await updateDoc(doc(db, "companies", employerId), {
      ...data,
      updatedAt: this._now()
    });
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
if (!window.USE_FIREBASE) {
  DB.seed();
}
