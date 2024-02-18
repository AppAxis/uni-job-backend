const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controllers/utils/googleAuth.js'); // Google Auth middleware
const { signup,signin,getMe,editProfile,forgetPassword,resetPassword,changePassword,editProfileImage, loadAuth,successGoogleLogin,failureGoogleLogin,} = require('../controllers/userController.js');
const multer = require('../middlewares/imageStorage.js');
const upload = require('../middlewares/fileStorage.js');
const { protect } = require('../middlewares/auth.js');
router.use(passport.initialize());
router.use(passport.session());


router.post('/signup', multer,signup);
router.post('/signin', signin);
router.get('/me',protect, getMe);
router.put('/editprofile',protect, editProfile);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);
router.put('/changePassword',protect, changePassword);
router.put('/editProfileImage',protect,multer, editProfileImage);
// Auth routes
router.get('/auth', loadAuth);
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/success',
    failureRedirect: '/failure',
  })
);
router.get('/success', successGoogleLogin);
router.get('/failure', failureGoogleLogin);


// GET request route
router.get('/', (req, res) => {
  res.send('GET request to /api/users is working');
});

module.exports = router;
