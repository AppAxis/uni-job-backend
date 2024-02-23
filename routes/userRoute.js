
import { Router } from 'express';
import {uploadCombinedImages}  from '../middlewares/imageStorage.js';
import uploadFile from '../middlewares/fileStorage.js'; 
import { protect} from '../middlewares/auth.js';
import {
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
  uploadResumeFile,
  editResume,
  signOut,

} from '../controllers/userController.js';

import passport from 'passport';
import '../controllers/utils/googleAuth.js';
const router = Router();
router.use(passport.initialize());
router.use(passport.session());


// choosing the right upload middleware based on the role of user
const chooseUploadMiddleware = (req, res, next) => {
  const { role } = req.user || req.body;
  console.log(role);
  if (role === 'jobSeeker') {
    return uploadSingleImage(req, res, next);
  } else if (role === 'recruiter') {
    return uploadMultiImage(req, res, next);
  } else {

    return next();
  }
};


// Post methods
//router.route('/signup').post(chooseUploadMiddleware, signup);
//router.route('/signup').post(uploadMultiImage, signup);
//router.route('/signup').post(uploadFile.single('resume_file'), signup);
router.route('/signup').post(uploadCombinedImages, signup);
router.route('/signin').post(signin);
router.route('/forgotPassword').post(forgetPassword);
router.route('/resetPassword').post(resetPassword);
router.post('/signOut',protect,signOut);
router.route('/uploadResumeFile').post(protect,uploadFile.single('resume_file'), uploadResumeFile);


// PUT Methods
router.route('/editprofile').put(protect, editProfile);
router.route('/changePassword').put(protect, changePassword);
router.route('/editProfileImage').put(protect,uploadCombinedImages, editProfileImage);
router.route('/editResume').put(protect,uploadFile.single('resume_file'), editResume);

// GET Methods
router.route('/me') .get(protect, getMe);
router.route('/auth').get(loadAuth);
router.route('/auth/google')
    .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

    router.route('/auth/google/callback').get((req, res, next) => {
      passport.authenticate('google', (err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.redirect('/failure');
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.redirect('/api/users/success'); 
        });
      })(req, res, next);
    });
router.route('/success').get(successGoogleLogin);

router.route('/failure').get(failureGoogleLogin);

router.route('/')
  .get((req, res) => {
    res.send('GET request to /api/users is working');
  });


 




export default router;