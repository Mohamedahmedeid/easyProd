const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB
    // eslint-disable-next-line no-undef
    await mongoose.connect(process.env.MONGO_URI, {

    });

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    // eslint-disable-next-line no-undef
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
