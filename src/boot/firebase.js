import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  
};

let app = initializeApp(firebaseConfig);

// Get Firestore instance
let db = getFirestore(app);
let auth = getAuth(app)
// Export Firestore
export { app, db, auth }
export default db

