import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAlLJWyA_fMe0m9-BDEsnVpfolmFyEqC6Q",
  authDomain: "recruitmentsystem-da103.firebaseapp.com",
  projectId: "recruitmentsystem-da103",
  storageBucket: "recruitmentsystem-da103.firebasestorage.app",
  messagingSenderId: "624531789732",
  appId: "1:624531789732:web:fca8ee1330c1e312a01331",
  measurementId: "G-0PSD8BW7KB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
