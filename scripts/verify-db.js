// scripts/verify-db.js
const mongoose = require('mongoose');

async function verifyDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const MONGODB_DB = process.env.MONGODB_DB || "highway-delight";
  
  const uri = `${MONGODB_URI.replace(/\/$/, "")}/${MONGODB_DB}`;
  
  console.log('🔍 Verifying database connection...\n');
  console.log(`📡 Connection URI: ${uri}`);
  console.log(`🗄️  Database Name: ${MONGODB_DB}\n`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Get database information
    const db = mongoose.connection.db;
    console.log(`🗄️  Connected to database: ${db.databaseName}`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📝 Collections in database:`);
    
    if (collections.length === 0) {
      console.log('   - No collections found (database is empty)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    console.log(`\n🗄️  All databases on server:`);
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Database verification completed');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    process.exit(1);
  }
}

verifyDatabase().catch(console.error);

