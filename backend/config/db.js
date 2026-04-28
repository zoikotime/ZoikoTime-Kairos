const mongoose = require("mongoose");

let isConnected = false;

async function connectDB(uri) {
  if (!uri) {
    console.warn("MONGODB_URI not provided. Running without MongoDB connection.");
    return false;
  }

  if (isConnected) return true;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection skipped: ${error.message}`);
    return false;
  }
}

module.exports = { connectDB };
