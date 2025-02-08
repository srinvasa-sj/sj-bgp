import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyAoGs0xWn3oqnV4Z2o5JQmIyaIdCqfS46I",
  authDomain: "srinivas-jewellars.firebaseapp.com",
  projectId: "srinivas-jewellars",
  storageBucket: "srinivas-jewellars.appspot.com",
  messagingSenderId: "626344249659",
  appId: "1:626344249659:web:7925aa41bf2dfadbd40f1e",
  measurementId: "G-WTWX9E7VZG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const setupFirebase = async () => {
  try {
    // Set auth persistence
    await setPersistence(auth, browserLocalPersistence);

    // No emulator connection code here, Firebase will use real services
    console.log("Connected to Firebase services");

  } catch (error) {
    console.error("Error setting up Firebase:", error);
    toast.error('Error initializing application. Please refresh the page.');
  }
};

setupFirebase().catch(console.error);

export { auth, db };





// import { initializeApp } from "firebase/app";
// import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from "firebase/auth";
// import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// import { toast } from "sonner";

// const firebaseConfig = {
//   apiKey: "AIzaSyAoGs0xWn3oqnV4Z2o5JQmIyaIdCqfS46I",
//   authDomain: "srinivas-jewellars.firebaseapp.com",
//   projectId: "srinivas-jewellars",
//   storageBucket: "srinivas-jewellars.appspot.com",
//   messagingSenderId: "626344249659",
//   appId: "1:626344249659:web:7925aa41bf2dfadbd40f1e",
//   measurementId: "G-WTWX9E7VZG"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// const setupFirebase = async () => {
//   try {
//     // Set auth persistence
//     await setPersistence(auth, browserLocalPersistence);

//     // Connect to emulators in development
//     if (process.env.NODE_ENV === 'development') {
//       try {
//         connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
//         connectFirestoreEmulator(db, '127.0.0.1', 8080);
//         console.log("Connected to Firebase emulators");
//       } catch (error) {
//         console.error("Error connecting to emulators:", error);
//         toast.error('Please ensure Firebase emulators are running (firebase emulators:start)');
//       }
//     }
//   } catch (error) {
//     console.error("Error setting up Firebase:", error);
//     toast.error('Error initializing application. Please refresh the page.');
//   }
// };

// setupFirebase().catch(console.error);

// export { auth, db };

