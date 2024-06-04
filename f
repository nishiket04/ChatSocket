// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1yl54tvv2rYF9PWGqwbW4EtR5OTd_wB0",
  authDomain: "converse-1e750.firebaseapp.com",
  projectId: "converse-1e750",
  storageBucket: "converse-1e750.appspot.com",
  messagingSenderId: "884768104043",
  appId: "1:884768104043:web:884418ee11998faff99b2e",
  measurementId: "G-6VZ44P0EN7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);