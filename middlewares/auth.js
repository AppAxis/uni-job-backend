const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models/user.js');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Use the base User model to find the user
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'Not authorized' });
      }

      // Attach the user to the request object
      req.user = user;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
});

module.exports = { protect };