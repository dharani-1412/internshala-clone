// backend/db.js
const mongoose = require("mongoose");
require("dotenv").config();

const database = process.env.DATABASE_URL;

if (!database) {
  throw new Error("❌ DATABASE_URL is missing in .env file");
}

module.exports.connect = async () => {
  try {
    await mongoose.connect(database);
    console.log("✅ Database is connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
};
