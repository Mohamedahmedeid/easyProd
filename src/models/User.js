const mongoose = require('mongoose');//mongodb
const bcrypt = require('bcrypt');

// Define common options for text meta fields
const textMetaOptions = {
  x_position: { type: Number},
  y_position: { type: Number},
  fontSize: { type: Number, required: true },
  textColor: { type: String, required: true },
};

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dirName: { type: String },
  templates: {
    property: [{
      imageUrl: { type: String, required: true },
      titleMeta: textMetaOptions,
      descriptionMeta: textMetaOptions
    }]
  }
});


// Hash password before saving to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
