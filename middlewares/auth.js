import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export async function protect(req, res, next) {
  let token;

  try {
    // Check if authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } else {
      res.status(401).send({ success: false, message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error(error);
    res.status(401).send({ success: false, message: 'Not authorized' });
  }
}

export function isRecruiter (req,res,next) {
  try {
      if(req.user.role !== "recruiter") {
          return res.status(302).json({ success: false, message: "Not authorized,you're not recruiter"});
      } 
     next();
  }
   catch (error) {
      res.status(302).json({success: false, message: error});
  }
}

