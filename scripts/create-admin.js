const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdmin() {
  try {
    // Create user in Authentication
    const userRecord = await auth.createUser({
      email: 'obsadmin@mydomainliving.co.za',
      password: 'mydom3693',
      emailVerified: true,
    });

    // Add user to admins collection in Firestore
    await db.collection('admins').doc(userRecord.uid).set({
      email: 'obsadmin@mydomainliving.co.za',
      type: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Successfully created admin user:', userRecord.uid);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
