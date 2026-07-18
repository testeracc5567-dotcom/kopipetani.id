"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAYRpZ5BfNqiReMSznJNr84-cnr9A2e2Gk",
  authDomain: "kopipetaniid.firebaseapp.com",
  projectId: "kopipetaniid",
  storageBucket: "kopipetaniid.firebasestorage.app",
  messagingSenderId: "690420998130",
  appId: "1:690420998130:web:0feec76a4ac913ec40556b",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);