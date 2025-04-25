const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Firebase Admin SDK initialization
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'reztek-d495e'
});

const db = admin.firestore();

// Function to create composite index
async function createCompositeIndex() {
  try {
    console.log('Creating composite index for maintenanceRequests...');
    
    // Define the index configuration
    const indexConfig = {
      collectionGroup: 'maintenanceRequests',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'tenantId', order: 'ASCENDING' },
        { fieldPath: 'submittedAt', order: 'ASCENDING' },
        { fieldPath: '__name__', order: 'ASCENDING' }
      ]
    };

    // Create the index using the REST API
    const projectId = 'reztek-d495e';
    const databaseId = '(default)';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/collectionGroups/maintenanceRequests/indexes`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await admin.credential.cert(serviceAccount).getAccessToken()}`
      },
      body: JSON.stringify(indexConfig)
    });

    if (!response.ok) {
      throw new Error(`Failed to create index: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Index creation started. Operation ID:', result.name);
    console.log('Index creation completed successfully!');
  } catch (error) {
    console.error('Error creating index:', error);
  }
}

// Function to check if service account key exists
function checkServiceAccount() {
  const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Error: serviceAccountKey.json not found!');
    console.log('Please download your service account key from Firebase Console:');
    console.log('1. Go to Project Settings > Service Accounts');
    console.log('2. Click "Generate New Private Key"');
    console.log('3. Save the file as serviceAccountKey.json in the project root');
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('Starting Firebase setup...');
  
  // Check for service account
  checkServiceAccount();
  
  // Create composite index
  await createCompositeIndex();
  
  console.log('Firebase setup completed!');
  process.exit(0);
}

// Run the main function
main().catch(console.error); 