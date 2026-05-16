/* ========== DATABASE LAYER (Firestore) ========== */
import { db } from "./firebase-config.js";

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
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Expose onSnapshot for internal use
window.FirebaseFirestore = { onSnapshot };

window.DB = {
  /* === USERS === */
  async getUsers() {
    const q = collection(db, "users");
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getUserById(id) {
    if (!id) return null;
    const d = await getDoc(doc(db, "users", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async updateUser(id, data) {
    await updateDoc(doc(db, "users", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /* === JOBS === */
  async getJobs() {
    const q = collection(db, "jobs");
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getJobById(id) {
    if (!id) return null;
    const d = await getDoc(doc(db, "jobs", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async getJobsByEmployer(recruiterId) {
    const q = query(collection(db, "jobs"), where("recruiterId", "==", recruiterId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Fallback for old data
      const qOld = query(collection(db, "jobs"), where("createdBy", "==", recruiterId));
      const snapOld = await getDocs(qOld);
      return snapOld.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async createJob(data) {
    const jobData = {
      ...data,
      recruiterId: data.recruiterId || data.createdBy,
      createdAt: new Date().toISOString(),
      status: "active",
      views: 0,
    };
    const docRef = await addDoc(collection(db, "jobs"), jobData);
    return { id: docRef.id, ...jobData };
  },
  async updateJob(id, data) {
    await updateDoc(doc(db, "jobs", id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
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

  /* === APPLICATIONS === */
  async getApplications() {
    const q = collection(db, "applications");
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getApplicationById(id) {
    if (!id) return null;
    const d = await getDoc(doc(db, "applications", id));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async getApplicationsByJob(jobId) {
    const q = query(collection(db, "applications"), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async getApplicationsByCandidate(applicantId) {
    const q = query(collection(db, "applications"), where("applicantId", "==", applicantId));
    const snap = await getDocs(q);
    if (snap.empty) {
      const qOld = query(collection(db, "applications"), where("candidateId", "==", applicantId));
      const snapOld = await getDocs(qOld);
      return snapOld.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async hasApplied(jobId, candidateId) {
    const q = query(collection(db, "applications"), where("jobId", "==", jobId), where("candidateId", "==", candidateId));
    const snap = await getDocs(q);
    return !snap.empty;
  },
  async createApplication(data) {
    const appData = {
      ...data,
      applicantId: data.applicantId || data.candidateId,
      status: "applied",
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // CRITICAL: Ensure recruiterId is present for fast querying
    if (!appData.recruiterId && appData.jobId) {
      const job = await this.getJobById(appData.jobId);
      if (job) appData.recruiterId = job.recruiterId || job.createdBy;
    }
    const docRef = await addDoc(collection(db, "applications"), appData);
    return { id: docRef.id, ...appData };
  },
  // Realtime listeners
  onApplicationsByRecruiter(recruiterId, callback) {
    const { onSnapshot } = window.FirebaseFirestore;
    const q = query(collection(db, "applications")); // Listen to all, filter client-side for robustness
    return onSnapshot(q, async (snap) => {
      const allApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Filter apps where recruiterId matches OR jobId belongs to this recruiter
      // We do this by checking recruiterId first, then falling back to job lookup
      const myJobs = await this.getJobsByEmployer(recruiterId);
      const myJobIds = new Set(myJobs.map(j => j.id));
      
      const filtered = allApps.filter(a => 
        a.recruiterId === recruiterId || myJobIds.has(a.jobId)
      );
      callback(filtered);
    });
  },
  onApplicationsByCandidate(applicantId, callback) {
    const { onSnapshot } = window.FirebaseFirestore;
    const q = query(collection(db, "applications")); // Listen all for compatibility
    return onSnapshot(q, (snap) => {
      const allApps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const filtered = allApps.filter(a => 
        a.applicantId === applicantId || a.candidateId === applicantId
      );
      callback(filtered);
    });
  },
  async updateApplication(id, data) {
    await updateDoc(doc(db, "applications", id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return await this.getApplicationById(id);
  },

  /* === INTERVIEWS === */
  async getInterviews() {
    const q = collection(db, "interviews");
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "interviews"), interviewData);
    await this.updateApplication(appId, { status: "interview_scheduled" });
    return { id: docRef.id, ...interviewData };
  },

  /* === SAVED JOBS === */
  async getSavedJobs(userId) {
    const q = query(collection(db, "savedJobs"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async isJobSaved(userId, jobId) {
    const q = query(collection(db, "savedJobs"), where("userId", "==", userId), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    return !snap.empty;
  },
  async toggleSaveJob(userId, jobId) {
    const q = query(collection(db, "savedJobs"), where("userId", "==", userId), where("jobId", "==", jobId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await deleteDoc(doc(db, "savedJobs", snap.docs[0].id));
      return false;
    } else {
      await addDoc(collection(db, "savedJobs"), {
        userId,
        jobId,
        savedAt: new Date().toISOString()
      });
      return true;
    }
  },

  /* === COMPANIES === */
  async getCompanyByEmployer(employerId) {
    const d = await getDoc(doc(db, "companies", employerId));
    return d.exists() ? { id: d.id, ...d.data() } : null;
  },
  async createCompany(employerId, data) {
    await setDoc(doc(db, "companies", employerId), {
      employerId,
      ...data,
      createdAt: new Date().toISOString()
    });
  },
  async updateCompany(employerId, data) {
    await updateDoc(doc(db, "companies", employerId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  /* === MESSAGES === */
  async getMessages(userId, contactId) {
    // Note: This is a simplified fetch. For better performance, use a conversationId or composite index.
    const q1 = query(collection(db, "messages"), where("senderId", "==", userId), where("receiverId", "==", contactId));
    const q2 = query(collection(db, "messages"), where("senderId", "==", contactId), where("receiverId", "==", userId));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const msgs = [...s1.docs, ...s2.docs].map(d => ({ id: d.id, ...d.data() }));
    return msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },
  async sendMessage(senderId, receiverId, content) {
    const msg = {
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const docRef = await addDoc(collection(db, "messages"), msg);
    return { id: docRef.id, ...msg };
  },
  async getConversations(userId) {
    // Get all messages where user is involved
    const q1 = query(collection(db, "messages"), where("senderId", "==", userId));
    const q2 = query(collection(db, "messages"), where("receiverId", "==", userId));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const allMsgs = [...s1.docs, ...s2.docs].map(d => d.data());
    
    const contacts = new Set();
    allMsgs.forEach(m => {
      if (m.senderId === userId) contacts.add(m.receiverId);
      else contacts.add(m.senderId);
    });

    const results = [];
    for (const cId of contacts) {
      const contact = await this.getUserById(cId);
      const contactMsgs = allMsgs.filter(m => m.senderId === cId || m.receiverId === cId);
      const lastMsg = contactMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      const unreadCount = contactMsgs.filter(m => m.receiverId === userId && !m.read).length;
      
      results.push({
        contact,
        lastMessage: lastMsg,
        unreadCount
      });
    }
    return results;
  },
  async markAsRead(userId, contactId) {
    const q = query(collection(db, "messages"), where("senderId", "==", contactId), where("receiverId", "==", userId), where("read", "==", false));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => updateDoc(doc(db, "messages", d.id), { read: true }));
    await Promise.all(promises);
  },

  /* === MIGRATION TOOL === */
  async migrateFromLocalStorage() {
    const collections = ["jobs", "users", "applications", "companies", "interviews", "messages", "savedJobs"];
    let migratedCount = 0;

    for (const key of collections) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const items = JSON.parse(data);
          if (Array.isArray(items)) {
            for (const item of items) {
              const id = item.id;
              if (id) {
                const dataToSave = { ...item };
                delete dataToSave.id;
                // Normalize field names during migration
                if (key === "jobs") {
                  dataToSave.recruiterId = dataToSave.recruiterId || dataToSave.createdBy;
                }
                if (key === "applications") {
                  dataToSave.applicantId = dataToSave.applicantId || dataToSave.candidateId;
                  // Try to find recruiterId from jobs
                  if (!dataToSave.recruiterId && dataToSave.jobId) {
                    const jobsData = localStorage.getItem("jobs");
                    if (jobsData) {
                      const jobs = JSON.parse(jobsData);
                      const job = jobs.find(j => j.id === dataToSave.jobId);
                      if (job) dataToSave.recruiterId = job.recruiterId || job.createdBy;
                    }
                  }
                }
                await setDoc(doc(db, key, id), dataToSave);
              } else {
                await addDoc(collection(db, key), item);
              }
            }
          } else if (typeof items === 'object') {
            // Handle single object if any (unlikely given _get implementation)
          }
          localStorage.removeItem(key);
          migratedCount++;
          console.log(`Migrated ${key} successfully.`);
        } catch (e) {
          console.error(`Failed to migrate ${key}:`, e);
        }
      }
    }
    if (migratedCount > 0) {
      console.log("Migration complete. Refreshing...");
      location.reload();
    }
  }
};

// Check for migration on load
if (localStorage.getItem("currentUser")) {
  // If we have a user, check if we need to migrate their old local data
  // Only do this once
  if (!localStorage.getItem("migration_done")) {
    window.DB.migrateFromLocalStorage().then(() => {
       localStorage.setItem("migration_done", "true");
    });
  }
}
