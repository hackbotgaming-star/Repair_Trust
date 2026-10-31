const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repairtrust';
  
  try {
    // Attempt connecting to configured URI with short timeout
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('[Database] Connected to external MongoDB successfully.');
  } catch (err) {
    console.log('[Database] External MongoDB not reachable. Initializing embedded MongoMemoryServer...');
    try {
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Embedded MongoDB Memory Server started successfully at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize MongoMemoryServer:', memErr);
      throw memErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[Database] Mongoose connection error:', err);
  });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
