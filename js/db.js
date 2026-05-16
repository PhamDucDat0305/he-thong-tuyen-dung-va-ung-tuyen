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

// Expose onSnapshot for internal use (mostly in app.js or page scripts)
window.FirebaseFirestore = { onSnapshot };

/**
 * Database utility object for Firestore interactions
 */
window.DB = {
  /* ================= USERS ================= */

  /**
   * Fetch all users
   */
  async getUsers() {
    try {
      const q = collection(db, "users");
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("DB: getUsers error", error);
      return [];
    }
  },

  /**
   * Fetch user by ID
   */
  async getUserById(userId) {
    if (!userId) return null;
    try {
      const d = await getDoc(doc(db, "users", userId));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    } catch (error) {
      console.error(`DB: getUserById error for ${userId}`, error);
      return null;
    }
  },

  /**
   * Update user data
   */
  async updateUser(userId, data) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`DB: updateUser error for ${userId}`, error);
      throw error;
    }
  },

  /* ================= JOBS ================= */

  /**
   * Fetch all active jobs
   */
  async getJobs() {
    try {
      const q = collection(db, "jobs");
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("DB: getJobs error", error);
      return [];
    }
  },

  /**
   * Fetch job by ID
   */
  async getJobById(jobId) {
    if (!jobId) return null;
    try {
      const d = await getDoc(doc(db, "jobs", jobId));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    } catch (error) {
      console.error(`DB: getJobById error for ${jobId}`, error);
      return null;
    }
  },

  /**
   * Fetch jobs created by a specific employer
   */
  async getJobsByEmployer(employerId) {
    if (!employerId) return [];
    try {
      const q = query(collection(db, "jobs"), where("recruiterId", "==", employerId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Compatibility fallback for old data using 'createdBy'
        const qOld = query(collection(db, "jobs"), where("createdBy", "==", employerId));
        const snapOld = await getDocs(qOld);
        return snapOld.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error(`DB: getJobsByEmployer error for ${employerId}`, error);
      return [];
    }
  },

  /**
   * Create a new job listing
   */
  async createJob(data) {
    try {
      const jobData = {
        ...data,
        recruiterId: data.recruiterId || data.createdBy,
        createdAt: new Date().toISOString(),
        status: "active",
        views: 0,
      };
      const docRef = await addDoc(collection(db, "jobs"), jobData);
      return { id: docRef.id, ...jobData };
    } catch (error) {
      console.error("DB: createJob error", error);
      throw error;
    }
  },

  /**
   * Update an existing job
   */
  async updateJob(jobId, data) {
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.getJobById(jobId);
    } catch (error) {
      console.error(`DB: updateJob error for ${jobId}`, error);
      throw error;
    }
  },

  /**
   * Delete a job listing
   */
  async deleteJob(jobId) {
    try {
      await deleteDoc(doc(db, "jobs", jobId));
    } catch (error) {
      console.error(`DB: deleteJob error for ${jobId}`, error);
      throw error;
    }
  },

  /**
   * Increment view counter for a job
   */
  async incrementJobViews(jobId) {
    try {
      const job = await this.getJobById(jobId);
      if (job) {
        await updateDoc(doc(db, "jobs", jobId), { views: (job.views || 0) + 1 });
      }
    } catch (error) {
      console.warn(`DB: incrementJobViews error for ${jobId}`, error);
    }
  },

  /* ================= APPLICATIONS ================= */

  /**
   * Fetch all applications
   */
  async getApplications() {
    try {
      const q = collection(db, "applications");
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("DB: getApplications error", error);
      return [];
    }
  },

  /**
   * Fetch application by ID
   */
  async getApplicationById(applicationId) {
    if (!applicationId) return null;
    try {
      const d = await getDoc(doc(db, "applications", applicationId));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    } catch (error) {
      console.error(`DB: getApplicationById error for ${applicationId}`, error);
      return null;
    }
  },

  /**
   * Fetch applications for a specific job
   */
  async getApplicationsByJob(jobId) {
    if (!jobId) return [];
    try {
      const q = query(collection(db, "applications"), where("jobId", "==", jobId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error(`DB: getApplicationsByJob error for ${jobId}`, error);
      return [];
    }
  },

  /**
   * Fetch applications submitted by a candidate
   */
  async getApplicationsByCandidate(candidateId) {
    if (!candidateId) return [];
    try {
      const q = query(collection(db, "applications"), where("applicantId", "==", candidateId));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        // Compatibility fallback for old data using 'candidateId' as field
        const qOld = query(collection(db, "applications"), where("candidateId", "==", candidateId));
        const snapOld = await getDocs(qOld);
        return snapOld.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error(`DB: getApplicationsByCandidate error for ${candidateId}`, error);
      return [];
    }
  },

  /**
   * Check if a candidate has already applied to a job
   */
  async hasApplied(jobId, candidateId) {
    if (!jobId || !candidateId) return false;
    try {
      // Check both field name variants
      const q1 = query(collection(db, "applications"), where("jobId", "==", jobId), where("applicantId", "==", candidateId));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) return true;

      const q2 = query(collection(db, "applications"), where("jobId", "==", jobId), where("candidateId", "==", candidateId));
      const snap2 = await getDocs(q2);
      return !snap2.empty;
    } catch (error) {
      return false;
    }
  },

  /**
   * Create a new job application
   */
  async createApplication(data) {
    try {
      const appData = {
        ...data,
        applicantId: data.applicantId || data.candidateId,
        status: "applied",
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Auto-fill recruiterId if missing for efficient dashboard queries
      if (!appData.recruiterId && appData.jobId) {
        const job = await this.getJobById(appData.jobId);
        if (job) appData.recruiterId = job.recruiterId || job.createdBy;
      }
      
      const docRef = await addDoc(collection(db, "applications"), appData);
      return { id: docRef.id, ...appData };
    } catch (error) {
      console.error("DB: createApplication error", error);
      throw error;
    }
  },

  /**
   * Realtime listener for recruiter's applications
   */
  onApplicationsByRecruiter(recruiterId, callback) {
    if (!recruiterId) return () => {};
    try {
      const { onSnapshot } = window.FirebaseFirestore;
      const q = query(collection(db, "applications"), where("recruiterId", "==", recruiterId)); 
      
      return onSnapshot(q, (snap) => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(apps);
      });
    } catch (error) {
      console.error("DB: onApplicationsByRecruiter error", error);
      return () => {};
    }
  },

  /**
   * Realtime listener for candidate's applications
   */
  onApplicationsByCandidate(candidateId, callback) {
    if (!candidateId) return () => {};
    try {
      const { onSnapshot } = window.FirebaseFirestore;
      const q = query(collection(db, "applications"), where("applicantId", "==", candidateId));
      
      return onSnapshot(q, (snap) => {
        const apps = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(apps);
      });
    } catch (error) {
      console.error("DB: onApplicationsByCandidate error", error);
      return () => {};
    }
  },

  async updateApplication(applicationId, data) {
    try {
      await updateDoc(doc(db, "applications", applicationId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return await this.getApplicationById(applicationId);
    } catch (error) {
      console.error(`DB: updateApplication error for ${applicationId}`, error);
      throw error;
    }
  },

  /**
   * Delete an application (Cancel application)
   */
  async deleteApplication(applicationId) {
    try {
      await deleteDoc(doc(db, "applications", applicationId));
    } catch (error) {
      console.error(`DB: deleteApplication error for ${applicationId}`, error);
      throw error;
    }
  },

  /* ================= INTERVIEWS ================= */

  /**
   * Fetch all scheduled interviews
   */
  async getInterviews() {
    try {
      const q = collection(db, "interviews");
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Fetch interview details for an application
   */
  async getInterviewByApplication(applicationId) {
    try {
      const q = query(collection(db, "interviews"), where("applicationId", "==", applicationId));
      const snap = await getDocs(q);
      return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    } catch (error) {
      return null;
    }
  },

  /**
   * Schedule a new interview
   */
  async scheduleInterview(applicationId, data) {
    try {
      const interviewData = {
        applicationId,
        ...data,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "interviews"), interviewData);
      await this.updateApplication(applicationId, { status: "interview_scheduled" });
      return { id: docRef.id, ...interviewData };
    } catch (error) {
      console.error("DB: scheduleInterview error", error);
      throw error;
    }
  },

  /* ================= SAVED JOBS ================= */

  /**
   * Fetch candidate's saved jobs
   */
  async getSavedJobs(userId) {
    try {
      const q = query(collection(db, "savedJobs"), where("userId", "==", userId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      return [];
    }
  },

  /**
   * Toggle job save status (Save/Unsave)
   */
  async toggleSaveJob(userId, jobId) {
    try {
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
    } catch (error) {
      console.error("DB: toggleSaveJob error", error);
      return false;
    }
  },

  /* ================= COMPANIES ================= */

  /**
   * Fetch company profile by employer ID
   */
  async getCompanyByEmployer(employerId) {
    if (!employerId) return null;
    try {
      const d = await getDoc(doc(db, "companies", employerId));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create or update company profile
   */
  async createCompany(employerId, data) {
    try {
      await setDoc(doc(db, "companies", employerId), {
        employerId,
        ...data,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("DB: createCompany error", error);
    }
  },

  /**
   * Update company details
   */
  async updateCompany(employerId, data) {
    try {
      await updateDoc(doc(db, "companies", employerId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("DB: updateCompany error", error);
    }
  },

  /* ================= MESSAGES ================= */

  /**
   * Fetch chat history between two users
   */
  async getMessages(userId, contactId) {
    try {
      const q1 = query(collection(db, "messages"), where("senderId", "==", userId), where("receiverId", "==", contactId));
      const q2 = query(collection(db, "messages"), where("senderId", "==", contactId), where("receiverId", "==", userId));
      
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const msgs = [...s1.docs, ...s2.docs].map(d => ({ id: d.id, ...d.data() }));
      return msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (error) {
      return [];
    }
  },

  /**
   * Send a new chat message
   */
  async sendMessage(senderId, receiverId, content) {
    try {
      const msg = {
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
        read: false,
      };
      const docRef = await addDoc(collection(db, "messages"), msg);
      return { id: docRef.id, ...msg };
    } catch (error) {
      console.error("DB: sendMessage error", error);
      throw error;
    }
  },

  /**
   * Fetch all conversations for a user
   */
  async getConversations(userId) {
    try {
      const q1 = query(collection(db, "messages"), where("senderId", "==", userId));
      const q2 = query(collection(db, "messages"), where("receiverId", "==", userId));
      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const allMsgs = [...s1.docs, ...s2.docs].map(d => ({ id: d.id, ...d.data() }));
      
      const contacts = new Set();
      allMsgs.forEach(m => {
        if (m.senderId === userId) contacts.add(m.receiverId);
        else contacts.add(m.senderId);
      });

      const results = [];
      for (const cId of contacts) {
        const contact = await this.getUserById(cId);
        const contactMsgs = allMsgs.filter(m => m.senderId === cId || m.receiverId === cId);
        const sorted = contactMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const lastMsg = sorted[0];
        const unreadCount = contactMsgs.filter(m => m.receiverId === userId && !m.read).length;
        
        results.push({
          contact,
          lastMessage: lastMsg,
          unreadCount
        });
      }
      return results;
    } catch (error) {
      console.error("DB: getConversations error", error);
      return [];
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(userId, contactId) {
    try {
      const q = query(collection(db, "messages"), where("senderId", "==", contactId), where("receiverId", "==", userId), where("read", "==", false));
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => updateDoc(doc(db, "messages", d.id), { read: true }));
      await Promise.all(promises);
    } catch (error) {
      // Ignore
    }
  },

  /* ================= MIGRATION TOOL ================= */

  /**
   * Migrate legacy data from LocalStorage to Firestore
   */
  async migrateFromLocalStorage() {
    const collections = ["jobs", "users", "applications", "companies", "interviews", "messages", "savedJobs"];
    let migratedCount = 0;

    for (const key of collections) {
      const data = localStorage.getItem(key);
      if (!data) continue;

      try {
        const items = JSON.parse(data);
        if (Array.isArray(items)) {
          for (const item of items) {
            const id = item.id;
            const dataToSave = { ...item };
            delete dataToSave.id;

            // Normalization
            if (key === "jobs") dataToSave.recruiterId = dataToSave.recruiterId || dataToSave.createdBy;
            if (key === "applications") {
              dataToSave.applicantId = dataToSave.applicantId || dataToSave.candidateId;
              if (!dataToSave.recruiterId && dataToSave.jobId) {
                const jobsData = localStorage.getItem("jobs");
                if (jobsData) {
                  const jobs = JSON.parse(jobsData);
                  const job = jobs.find(j => j.id === dataToSave.jobId);
                  if (job) dataToSave.recruiterId = job.recruiterId || job.createdBy;
                }
              }
            }

            if (id) {
              await setDoc(doc(db, key, id), dataToSave);
            } else {
              await addDoc(collection(db, key), dataToSave);
            }
          }
        }
        localStorage.removeItem(key);
        migratedCount++;
        console.info(`Migrated ${key} successfully.`);
      } catch (e) {
        console.error(`Failed to migrate ${key}:`, e);
      }
    }

    if (migratedCount > 0) {
      console.log("Migration complete. Refreshing...");
      location.reload();
    }
  }
};

// Check for migration on load
if (localStorage.getItem("currentUser") && !localStorage.getItem("migration_done")) {
  window.DB.migrateFromLocalStorage().then(() => {
    localStorage.setItem("migration_done", "true");
  });
}
