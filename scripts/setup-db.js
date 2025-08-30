// scripts/setup-db.js
const mongoose = require('mongoose');

// Database connection function
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  const MONGODB_DB = process.env.MONGODB_DB || "highway_delight_db";
  
  const uri = `${MONGODB_URI.replace(/\/$/, "")}/${MONGODB_DB}`;
  
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB database:', MONGODB_DB);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

// Initialize database collections and indexes
async function initializeDatabase() {
  try {
    const db = mongoose.connection.db;
    
    // List existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    console.log(`📝 Existing collections: ${collectionNames.join(', ') || 'None'}`);
    
    // Create collections if they don't exist
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created users collection');
    } else {
      console.log('✅ users collection already exists');
    }
    
    if (!collectionNames.includes('notes')) {
      await db.createCollection('notes');
      console.log('✅ Created notes collection');
    } else {
      console.log('✅ notes collection already exists');
    }
    
    // Create indexes for better performance
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created unique index on users.email');
    } catch (error) {
      if (error.code !== 85) { // Index already exists
        console.log('⚠️  users.email index already exists');
      }
    }
    
    try {
      await db.collection('users').createIndex({ googleId: 1 });
      console.log('✅ Created index on users.googleId');
    } catch (error) {
      if (error.code !== 85) { // Index already exists
        console.log('⚠️  users.googleId index already exists');
      }
    }
    
    try {
      await db.collection('notes').createIndex({ userId: 1 });
      console.log('✅ Created index on notes.userId');
    } catch (error) {
      if (error.code !== 85) { // Index already exists
        console.log('⚠️  notes.userId index already exists');
      }
    }
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Setup function
async function setupDatabase() {
  console.log('🚀 Setting up Highway Delight database...\n');
  
  const connected = await connectToDatabase();
  if (!connected) {
    console.log('\n💡 Make sure MongoDB is running and your connection string is correct.');
    console.log('   You can set MONGODB_URI and MONGODB_DB in your .env.local file.');
    process.exit(1);
  }
  
  // Initialize database collections and indexes
  await initializeDatabase();
  
  console.log('\n✅ Database setup complete!');
  console.log('   You can now run: npm run dev');
  
  await mongoose.disconnect();
}

// Run setup
setupDatabase().catch(console.error);
