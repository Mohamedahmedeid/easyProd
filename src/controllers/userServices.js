/* eslint-disable no-useless-catch */
const User = require('../models/User');

const userService = {
  // Get user data by ID
  getUserByname: async (username) => {
    try {
      const user = await User.findOne({username});
      if (!user) {
       return false;
      }
      return user;
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = userService;
