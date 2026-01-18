import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCL6hreumjGbqdLJaKHps01q4b7RM8jFrM",
  authDomain: "studybuddy-auth-638f9.firebaseapp.com",
  projectId: "studybuddy-auth-638f9",
  storageBucket: "studybuddy-auth-638f9.firebasestorage.app",
  messagingSenderId: "386516254236",
  appId: "1:386516254236:web:cde6aa8e7e87ef74e569d9",
  measurementId: "G-D90E05Q154"
};

const app = initializeApp(firebaseConfig);

// 1. Export the Auth instance
export const auth = getAuth(app);

// 2. Export the Google Provider
export const googleProvider = new GoogleAuthProvider();

// 3. Google Sign-In Function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

// 4. Export Email/Password Functions directly
export { signInWithEmailAndPassword, createUserWithEmailAndPassword };

// 5. Logout Function
export const logout = () => {
  signOut(auth);
};