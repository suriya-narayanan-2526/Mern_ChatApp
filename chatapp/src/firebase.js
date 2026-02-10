// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwcX9_KoSGVXxonLMhxoT1xJTe_iykxuw",
  authDomain: "suriyalocalchat-hub.firebaseapp.com",
  projectId: "suriyalocalchat-hub",
  storageBucket: "suriyalocalchat-hub.firebasestorage.app",
  messagingSenderId: "30991444976",
  appId: "1:30991444976:web:324716b1453145991ecb35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { app, storage };