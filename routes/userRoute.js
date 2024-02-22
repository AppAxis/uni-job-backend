
import { Router } from 'express';
import { uploadSingleImage, uploadMultiImage } from '../middlewares/imageStorage.js';
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
  editProfileResume,
 signOut,

} from '../controllers/userController.js';

import passport from 'passport';
import '../controllers/utils/googleAuth.js';
const router = Router();

router.use(passport.initialize());
router.use(passport.session());
// Post methods
//router.route('/signup').post(uploadMultiImage, signup);
//router.route('/signup').post(uploadFile.single('resume_file'), signup);
router.route('/signup').post(uploadSingleImage, signup);
router.route('/signin').post(signin);
router.route('/forgotPassword').post(forgetPassword);
router.route('/resetPassword').post(resetPassword);
router.post('/signOut',protect,signOut);

// PUT Methods
router.route('/editprofile').put(protect, editProfile);
router.route('/changePassword').put(protect, changePassword);
router.route('/editProfileImage').put(protect,uploadSingleImage, editProfileImage);
router.route('/editProfileResume').put(protect,uploadFile.single('resume_file'), editProfileResume);

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
          return res.redirect('/api/users/success'); // Ajoutez "/api/users" ici
        });
      })(req, res, next);
    });
router.route('/success').get(successGoogleLogin);

router.route('/failure').get(failureGoogleLogin);

router.route('/')
  .get((req, res) => {
    res.send('GET request to /api/users is working');
  });






  /*export function handleUploadMiddleware(req, res, next) {
    const userRole = req.body.role;
    console.log(userRole);
  
    if (userRole === 'jobSeeker') {
      return uploadSingleImage(req, res, next);
    } else if (userRole === 'recruiter') {
      return uploadMultiImage(req, res, next);
    } else {
      // Handle other roles or scenarios accordingly
      return next();
    }
  }*/

export default router;