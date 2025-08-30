// lib/db.ts
import mongoose from "mongoose"

const DEFAULT_URI = "mongodb://127.0.0.1:27017"
const DEFAULT_DB = "highway-delight"

const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_URI
const MONGODB_DB = process.env.MONGODB_DB || DEFAULT_DB

type MongooseCache = {
	conn: typeof mongoose | null
	promise: Promise<typeof mongoose> | null
}

declare global {
	// eslint-disable-next-line no-var
	var mongooseCache: MongooseCache | undefined
}

let cached = global.mongooseCache

if (!cached) {
	cached = global.mongooseCache = { conn: null, promise: null }
}

export async function connectToDatabase() {
	if (!cached!.promise) {
		// Ensure we're connecting to a specific database
		const uri = `${MONGODB_URI.replace(/\/$/, "")}/${MONGODB_DB}`
		console.log(`🔗 Connecting to MongoDB: ${uri}`)
		console.log(`🗄️  Database name: ${MONGODB_DB}`)
		
		cached!.promise = mongoose.connect(uri, {
			bufferCommands: false,
			serverSelectionTimeoutMS: 15000,
		}).then(async (connection) => {
			console.log(`✅ Connected to MongoDB database: ${MONGODB_DB}`)
			
			// Initialize database collections
			await initializeDatabase(connection)
			
			return connection
		})
	}

	cached!.conn = await cached!.promise
	return cached!.conn
}

async function initializeDatabase(connection: typeof mongoose) {
	try {
		const db = connection.connection.db
		if (!db) {
			console.error('❌ Database connection not available')
			return
		}
		
		console.log(`🗄️  Connected to database: ${db.databaseName}`)
		
		// List existing collections
		const collections = await db.listCollections().toArray()
		const collectionNames = collections.map(col => col.name)
		
		console.log(`📝 Existing collections: ${collectionNames.join(', ') || 'None'}`)
		
		// Create collections if they don't exist
		if (!collectionNames.includes('users')) {
			await db.createCollection('users')
			console.log('✅ Created users collection')
		} else {
			console.log('✅ users collection already exists')
		}
		
		if (!collectionNames.includes('notes')) {
			await db.createCollection('notes')
			console.log('✅ Created notes collection')
		} else {
			console.log('✅ notes collection already exists')
		}
		
		// Create indexes for better performance
		try {
			await db.collection('users').createIndex({ email: 1 }, { unique: true })
			console.log('✅ Created unique index on users.email')
		} catch (error: any) {
			if (error.code !== 85) { // Index already exists
				console.log('⚠️  users.email index already exists')
			}
		}
		
		try {
			await db.collection('users').createIndex({ googleId: 1 })
			console.log('✅ Created index on users.googleId')
		} catch (error: any) {
			if (error.code !== 85) { // Index already exists
				console.log('⚠️  users.googleId index already exists')
			}
		}
		
		try {
			await db.collection('notes').createIndex({ userId: 1 })
			console.log('✅ Created index on notes.userId')
		} catch (error: any) {
			if (error.code !== 85) { // Index already exists
				console.log('⚠️  notes.userId index already exists')
			}
		}
		
		console.log('✅ Database initialization completed')
		
	} catch (error) {
		console.error('❌ Error initializing database:', error)
	}
}
