import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjUGwcejWW1gSyjxaGaYONh8Nj8MLo0gQ",
  authDomain: "chatapp-e4881.firebaseapp.com",
  projectId: "chatapp-e4881",
  storageBucket: "chatapp-e4881.appspot.com",
  messagingSenderId: "1019046535760",
  appId: "1:1019046535760:web:fdd713f15f58c43ec12755",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const database = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const auth = getAuth();
