/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const userService = require('../controllers/userServices');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const host = req.get('host'); // Get hostname along with port

    // Check if the provided credentials match the admin credentials
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const adminPayload = {
        user: {
          id: 'admin', // You might want to differentiate admin and regular user IDs
          username: username,
          isAdmin: true // Add a flag to indicate admin status
        }
      };
      // Sign token for admin
      jwt.sign(
        adminPayload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            isAdmin: true // Include admin flag in the response
          });
        }
      );
      return; // End the function execution here if admin credentials match
    }

    // Find user by username
    const user = await userService.getUserByname(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }
   
    // Get user templates URLs
    const templateUrls = await getTemplateUrls(user._id, host);
    if (templateUrls === null) {
     res.status(404).json({ error: "Templates aren't uploaded" }); 
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        isAdmin: false // Add a flag to indicate regular user status
      }
    };
    
    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // Send token along with user ID, template URLs, and template metadata
        res.json({ 
          token,
          userId: user._id,
          templates: templateUrls,
          templatesMeta: user.templates,
          isAdmin: false ,// Include admin flag in the response
          username: user.username
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const getTemplateUrls = async (userId, host) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User NOT Found');
    }

    // Check if user.templates is defined and has at least two elements
    if (!user.templates.property || user.templates.property.length < 2) {
      // throw new Error('User templates are missing or incomplete');
      return null;
    }

    const imagePaths = [
      user.templates.property[0].imageUrl,
      user.templates.property[1].imageUrl
    ];

    const templateUrls = [];

    // Construct URLs for each image
    for (const imagePath of imagePaths) {
      const imageUrl = `http://${host}/${user.dirName}/${imagePath}`;
      templateUrls.push(imageUrl);
    }

    return templateUrls;
  } catch (error) {
    console.error("Error in getTemplateUrls:", error);
    throw error;
  }
};

module.exports = router;
