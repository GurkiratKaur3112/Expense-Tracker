const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if local mongod is offline
    });
    console.log(`[Database] MongoDB Connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Standard connection to ${uri} failed: ${error.message}`);
    console.log('[Database] Attempting fallback to in-memory MongoDB for local evaluation/testing...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB at: ${memoryUri}`);
      return conn;
    } catch (fallbackError) {
      console.error('[Database] In-memory MongoDB initialization failed:', fallbackError.message);
      console.error('[Database] Please ensure MongoDB is running or specify a valid MONGODB_URI in server/.env');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
