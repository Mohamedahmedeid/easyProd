/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fs = require('fs/promises'); // Use fs.promises for async file operations
const User = require('../models/User')
const multer = require('multer');
const { v4: uuidv4 } = require('uuid'); // Import v4 function from uuid for generating UUIDs
exports. upload  = multer({
    single : "img",
    storage : multer.memoryStorage(),
    limits : {
        fileSize: 10 * 1024 * 1024, // Adjust the file size limit as needed (10MB in this example)
        fieldSize: 10 * 1024 * 1024, // Adjust the field size limit as needed (10MB in this example)
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload a jpg, jpeg, or png image file'));
      }
      cb(null, true);
    }
  });
  exports.saveTemplate = async (imageBuffer, userId, userData) => {
    const filename = `template-${Date.now()}.png`;
    const destinationDir = `./src/uploads/`;
    const username = userData.username;
    let titleMeta = userData.titleMeta;
    let descriptionMeta = userData.descriptionMeta;
    // name = name + "-template";
    try {
        const existingDirs = await fs.readdir(destinationDir);
        const user = await User.findById(userId);
        const directoryExists = existingDirs.some(dir => dir === user.dirName);
        const dirName = `${username}-${uuidv4()}`;
          // Check if user exists with the exact case
          if (!user) {
              throw new Error('User not found');
          }
  
        // If the directory exists, use it; otherwise, create a new one
        if (!directoryExists) {
                await fs.mkdir(`${destinationDir}${dirName}`, { recursive: true });
                // Assign dirName to the existingUser
                user.dirName = dirName;
                 await user.save();   
        }
      
        const imageUrl = filename;
        // Convert titleMeta and descriptionMeta to objects
        titleMeta = JSON.parse(titleMeta);
        descriptionMeta = JSON.parse(descriptionMeta);

        // Query the user document to check the length of templates array
        if (user.templates.property.length < 2) { // Check if the length is less than 2
            // Update user's templates with the new template
            await User.findByIdAndUpdate(userId, {
                $push: {
                    'templates.property': { // Specify the path to the property array
                        imageUrl,
                        titleMeta,
                        descriptionMeta
                    }
                }
            });
            
            console.log("Template saved successfully:", filename);
                // Write image to user directory
        await fs.writeFile(`${destinationDir}/${user.dirName}/${filename}`, imageBuffer.buffer);
        } else {
            console.error("Cannot save template: Maximum template limit reached.");
        }
    } catch (err) {
        console.error("Error saving template:", err);
    }
};

