const jwt = require ('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const asyncHandler = require('express-async-handler');
const { User, JobSeeker, Recruiter } = require('../models/user.js');
const generateToken = require('./utils/generateToken.js');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      location,
      phone,
      domain,
    } = req.body;
  
    const profileImg = req.file ? req.file.filename : "/img/user.png";
  
    try {
      if (!username || !email || !password || !confirmPassword || !role) {
        return res.status(400).json({ message: 'Please add all fields.' });
      }
  
      if (!['jobSeeker', 'recruiter'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified.' });
      }
  
      const userExist = await User.findOne({ email });
      if (userExist) {
        return res.status(400).json({ message: 'User already exists.' });
      }
  
      if (password !== confirmPassword) {
        return res.status(400).json({ message: `Passwords don't match.` });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        location,
        phone,
        domain,
        role,
        profileImg,
      });
  
      if (role === 'jobSeeker') {
        const jobSeeker = new JobSeeker({
          type: req.body.type,
          skills: req.body.skills,
          resume_file: req.file ? req.file.filename : '',
        });
        newUser.role = jobSeeker.role;
        newUser.roleData = jobSeeker;
      } else if (role === 'recruiter') {
        const recruiter = new Recruiter({
          type: req.body.type,
          //workspace_images: req.body.workspace_images,
          workspace_images: req.files ? req.files.map(file => file.filename) : ['/img/company.png'],
        });
        newUser.role = recruiter.role;
        newUser.roleData = recruiter;
      }
  
      const savedUser = await newUser.save();
      const token = generateToken(savedUser._id);
      const userId = savedUser._id;
  
      res.status(201).json({
        message: 'User registered successfully.',
        userId,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// @desc    Authenticate user
// @route   POST /api/users/signin
// @access  Public
const signin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      // check for user email
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Generate token after successful login
        const token = generateToken(user._id);
  
        // Send the response with token
        res.json({
          _id: user.id,
          username: user.username,
          email: user.email,
          token,
        });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// @desc    Get user data
// @route   Get /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user)
  });

  // @desc    Update user data
// @route   PUT /api/users/editprofile
// @access  Private
  const editProfile = asyncHandler(async (req, res) => {
    try {
      const updateFields = { ...req.body };
  
      if (updateFields.password) {
        const hashedPassword = await bcrypt.hash(updateFields.password, 10);
        updateFields.password = hashedPassword;
      }
  
      const user = await User.findByIdAndUpdate(req.user._id, updateFields, { new: true });
  
      return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });
  // @desc    Update user profile image
// @route   PUT /api/users/editProfileImage
// @access  Private
const editProfileImage = asyncHandler(async (req, res) => {
    try {
      const { filename } = req.file;
  
      // Update the user's profile image
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImg: filename },
        { new: true }
      );
  
      return res.status(200).json({
        message: 'Profile image updated successfully',
        profileImg: user.profileImg,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
// @desc    forget password
// @route   POST /api/users/forgetPassword
// @access  Public

  const forgetPassword = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body; 
  
      const userData = await User.findOne({ email: email });
  
      if (userData) {
        const randomString = randomstring.generate();
        const data = await User.updateOne({ email: email }, { $set: { token: randomString } });
        sendResetPasswordMail(userData.username, email, randomString);
        res.status(200).send({ success: true, msg: "Please check your email for reset password" });
      } else {
        res.status(200).send({ success: true, msg: "This email does not exist" });
      }
    } catch (error) {
      console.error(error);
      res.status(400).send({ success: false, msg: error.message });
    }
  });
  // @desc  reset password
  // @route POST /api/users/resetPassword/:token
  // @access Private
  const resetPassword = asyncHandler(async (req, res) => {
  try{
    const token = req.query.token;
    const tokenData = await User.findOne({token:token});
    if(tokenData){
        const {password, confirmPassword} = req.body;
        if(password !== confirmPassword){
            return res.status(400).send({success :false,msg:"Passwords don't match"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userData = await User.findByIdAndUpdate({_id:tokenData._id},{$set:{password:hashedPassword,token:''}},{new:true});
        res.status(200).send({success :true,msg:"Password reset successfully",data : userData});

    }else{
        res.status(200).send({success :true,msg:"Invalid token"});

    }

  }catch(error){
    res.status(400).send({success :false,msg:error.message});
  }
  });
  // @desc    Change user password
// @route   PUT /api/users/changePassword
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      // Check if newPassword and confirmPassword match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, msg: "New passwords don't match" });
      }
  
      // Find the user by ID
      const user = await User.findById(req.user._id);
  
      // Check if the current password is correct
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ success: false, msg: 'Invalid current password' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ success: true, msg: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: 'Internal server error' });
    }
  });


const sendResetPasswordMail = asyncHandler( async (username,email, token) => {
try{
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS:true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
 });
 const mailOptions ={
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password',
        html:'<h1>Reset Password</h1><p> Hi '+username+'Click <a href="http://127.0.0.1:3000/resetPassword?token='+token+'">here</a> to reset your password</p>' 
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}catch(error){
    res.status(400).send({success :false,msg:error.message});
}

});

const loadAuth = (req,res)=>{
    res.render('auth')
}
const successGoogleLogin = (req,res)=>{
    if(!req.user)
    res.redirect('/failure');
console.log(req.user);
res.send("welcome"+req.user.email);
}
const failureGoogleLogin = (req,res)=>{
    res.send("Error");
}
module.exports = {
signup,
signin,
getMe,
editProfile,
forgetPassword,
resetPassword,
changePassword, 
editProfileImage,
loadAuth,
successGoogleLogin,
failureGoogleLogin,
}