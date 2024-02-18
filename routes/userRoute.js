const express = require('express');
const router = express.Router();
const passport = require('passport');
router.use(passport.initialize());
router.use(passport.session());
const { signup,signin,getMe,editProfile,forgetPassword,resetPassword,changePassword,editProfileImage} = require('../controllers/userController.js');
const multer = require('../middlewares/imageStorage.js');
const upload = require('../middlewares/fileStorage.js');
const { protect } = require('../middlewares/auth.js');

router.post('/signup', multer,signup);
router.post('/signin', signin);
router.get('/me',protect, getMe);
router.put('/editprofile',protect, editProfile);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);
router.put('/changePassword',protect, changePassword);
router.put('/editProfileImage',protect,multer, editProfileImage);

// GET request route
router.get('/', (req, res) => {
  res.send('GET request to /api/users is working');
});

module.exports = router;
