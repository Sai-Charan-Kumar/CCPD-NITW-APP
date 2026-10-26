const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri =
  process.env.MONGODB_URI
  || 'mongodb+srv://sdmdsami:djbravo00@cluster0.wmimil.mongodb.net/';
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
};

module.exports = connectDatabase;
