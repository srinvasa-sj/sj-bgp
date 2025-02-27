import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyBHvfSUV6bCzMhHZJTVhVIPgQvRGcvNR8s",
  authDomain: "srinivasajewellers-bgp.firebaseapp.com",
  projectId: "srinivasajewellers-bgp",
  storageBucket: "srinivasajewellers-bgp.appspot.com",
  messagingSenderId: "902589055367",
  appId: "1:902589055367:web:4678306e399f4289269322",
  measurementId: "G-D087V83R2V"
};

let app;
let db;
let auth;
let storage;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  
  // Initialize Firestore with persistence
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  // Initialize auth with persistence
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth persistence error:", error);
    toast.error("Error setting up authentication persistence");
  });

  // Initialize storage
  storage = getStorage(app);

  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  toast.error('Failed to initialize Firebase services');
}

export { app, auth, db, storage };





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

