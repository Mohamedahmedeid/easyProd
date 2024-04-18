/* eslint-disable no-undef */
// Import necessary modules
const User = require('../models/User');
const upload =require ('../middleware/uploadMiddleware');
const validateRegistrationData = require('../utils/validatation'); // Import the validation function
const fs = require('fs');
const path = require('path');
const validateImageUploadData = require('../utils/validatation');
const Joi = require('joi');

const usernameSchema = Joi.string()
    .pattern(/^\S*$/)
    .alphanum()
    .min(3)
    .max(15)
    .required()
    .messages({
        'string.pattern.base': 'Username should not contain spaces',
        'string.alphanum': 'Username should only contain alphanumeric characters',
        'string.empty': 'Username is required',
        'string.min': 'Username should have a minimum length of {#limit} characters',
        'string.max': 'Username should have a maximum length of {#limit} characters',
    });
// Define controller functions
const adminController = {
  // Create new user
   createUser : async (req, res) => {
    try {
      console.log(req.body);
      const { username, password } = req.body;
  
      // Validate username
      const { error: usernameError } = usernameSchema.validate(username, { abortEarly: false });
      if (usernameError) {
          const errors = usernameError.details.map(err => err.message);
          return res.status(400).json({ errors });
      }
  
      // Validate registration data
      const { errors, isValid } = validateRegistrationData.validateRegistrationData(req.body);
      if (!isValid) {
        return res.status(400).json(errors);
      }
      if (username === process.env.ADMIN_USERNAME){
        return res.json({error : "This is Admin Username"});
      }
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Create new user
      const newUser = new User({ username, password });
      await newUser.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Upload template for user and add metadata
  uploadTemplate: async (req, res) => {
    try {
      const { userId } = req.params;
      const userData = req.body;
      const image = req.file;
      const { errors, isValid } = validateImageUploadData.validateImageUploadData({ image });
      if (!isValid) {
        return res.status(400).json(errors);
      }
      upload.saveTemplate(image ,userId, userData)
      res.status(200).json({ message: 'Template uploaded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user data (including images, titles, descriptions, templates, and metadata)
  getUserData: async (req, res) => {
    try {
      const { username } = req.params;
      // Retrieve user data
      const user = await User.findOne({username});
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  // Delete user

deleteUser: async (req, res) => {
  try {
    const  username  = req.body.username;
    // Check if user exists
    console.log(username);
    const user = await User.findOne({username});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if(!user.dirName){
      console.log(`Directory ${user.username} does not exist.`)
    }else {
    // Delete directory associated with the user
    const userDirPath = path.join(process.cwd(), './src/uploads/', user.dirName);

    if (fs.existsSync(userDirPath)) {
      fs.rmSync(userDirPath, { recursive: true });
    }
  }
    // Delete user from database
    await User.findOneAndDelete({username});
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
},


  // Get all users
  getAllUsernames: async (req, res) => {
    try {
        const users = await User.find();
        const usernames = users.map(user => user.username); // Assuming 'name' is the field containing the username
        res.status(200).json({ usernames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

,
  // delete Template
  deleteTemplate: async (req, res) => {
  try {
    const { username  } = req.body; // Assuming username is passed as a parameter in the request
    const templateId = req.body.templateId._id;
    const { templatename } = req.params;
    console.log(templateId);
    console.log(templatename);
    // Find the user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(!user.dirName){
      console.log(`Directory ${user.username} does not exist.`)
    }else {
    // Delete directory associated with the user
    const userDirPath = path.join(process.cwd(), './src/uploads/', user.dirName,`${templatename}`);

    if (fs.existsSync(userDirPath)) {
      fs.rmSync(userDirPath, { recursive: true });
    }
  }
      // Find index of template in user's templates array
      const templateIndex = user.templates.property.findIndex(t => t._id.toString() === templateId);

      if (templateIndex === -1) {
        return res.status(404).json({ message: "Template not found for this user" });
      }
  
      // Remove template from array
      user.templates.property.splice(templateIndex, 1);
  
      // Save the updated user object
      await user.save();
    // Delete the template (assuming it's a single document)

    return res.status(200).json({ message: "Template deleted successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
},
changePassword :  async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // If user does not exist, return error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Update the user's password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
},
geTemplates: async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User NOT Found');
    }

    // Check if user.templates is defined and has at least two elements
    if (!user.templates.property) {
      return res.json({ templateUrls: [] }); // Return an empty array if templates are missing or incomplete
    }

    const imagePaths = user.templates.property.map(property => property.imageUrl);

    const templateUrls = imagePaths.map(imagePath => {
      return `http://${req.get('host')}/${user.dirName}/${imagePath}`;
    });

    res.json({ templateUrls });
  } catch (error) {
    console.error("Error in getTemplateUrls:", error);
    res.json({ errorMsg: error.message });
    throw error;
  }
}
}


// Export adminController object
module.exports = adminController;
