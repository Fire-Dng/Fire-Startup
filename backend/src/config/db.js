const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', false);
  const fallbackUri = env.LOCAL_FALLBACK_MONGODB_URI;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn.connection;
  } catch (err) {
    console.warn(
      `⚠️  [MongoDB] Primary connection failed (${err.message}). Attempting local MongoDB fallback (${fallbackUri})...`
    );

    if (env.MONGODB_URI !== fallbackUri && fallbackUri) {
      try {
        const localConn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log(
          `[MongoDB] Connected via Local Fallback: ${localConn.connection.host}/${localConn.connection.name}`
        );
        return localConn.connection;
      } catch (localErr) {
        console.warn(`[MongoDB] Local fallback also failed (${localErr.message}).`);
      }
    }

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      isConnected = true;
      console.log(`[MongoDB] Connected to In-Memory MongoDB Server`);
      return conn.connection;
    } catch (fallbackErr) {
      console.error(`[MongoDB] Connection Error:`, fallbackErr.message);
      throw err;
    }
  }
};

module.exports = { connectDB };
