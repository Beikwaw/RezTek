const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBgIQqBu_0oCqSBgUVvjUJkxIRBCVdhQoI",
  authDomain: "reztek-mdo.firebaseapp.com",
  projectId: "reztek-mdo",
  storageBucket: "reztek-mdo.appspot.com",
  messagingSenderId: "1098979605513",
  appId: "1:1098979605513:web:d0c6f5fc6c2af04d2a2c5c",
  measurementId: "G-RLCD9YBKX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdmin() {
  try {
    // First sign in as the admin
    const userCredential = await signInWithEmailAndPassword(auth, 'obsadmin@mydomainliving.co.za', 'mydom3693');
    const user = userCredential.user;

    // Add admin document
    await setDoc(doc(db, 'admins', user.uid), {
      email: 'obsadmin@mydomainliving.co.za',
      type: 'admin',
      createdAt: new Date(),
      name: 'Observatory Admin',
      residence: 'My Domain Observatory'
    });

    console.log('Successfully set up admin document');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

setupAdmin();
