/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// const User = require('../models/User');
const upload = require('../middleware/uploadMiddleware');

// Route for adding a new user
router.post('/addUser', adminController.createUser);

// Route for uploading templates for a user
router.post('/:userId/uploadTemplate', upload.upload.single('template') ,adminController.uploadTemplate);

//delete templates for a user
// delete user
router.post('/deleteUser', adminController.deleteUser);

// delete template

// Route for fetching all users
router.get('/users', adminController.getAllUsernames);

// Route for fetching user data by ID
router.get('/users/:username', adminController.getUserData);

router.post('/change-password', adminController.changePassword);

router.get('/geTemplates/:userId' , adminController.geTemplates);


router.post('/deleteTemplate/:templatename' , adminController.deleteTemplate);



module.exports = router;
