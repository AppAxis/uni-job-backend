
import { Router } from 'express';
import {uploadCombinedImages}  from '../middlewares/image-storage.js';
import uploadFile from '../middlewares/file-storage.js'; 
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import {
  signup,
  signin,
  getMe,
  getUserById,
  editProfile,
  forgetPassword,
  resetPassword,
  updatePassword,
  changePassword,
  getAllJobSeekers,
  getAllRecruiters,
  searchJobSeekers,
  editProfileImage,
  editCompanyImages,
  loadAuth,
  successGoogleLogin,
  failureGoogleLogin,
  uploadResumeFile,
  editResume,
  signOut,
  updateUserCoins,
  getJobSeekersWithoutLikesByRecruiterId,

} from '../controllers/userController.js';

import passport from 'passport';
import '../controllers/utils/googleAuth.js';
const router = Router();
router.use(passport.initialize());
router.use(passport.session());


// Post methods

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
router.route('/editCompanyImages').put(protect, uploadCombinedImages, editCompanyImages);
router.route('/editResume').put(protect,uploadFile.single('resume_file'), editResume);
router.route('/updatePassword').put(protect, updatePassword);
router.route('/:id/update-coins').put(protect,updateUserCoins)
// GET Methods
router.route('/me') .get(protect, getMe);
router.route('/getUserById/:id').get(protect,isRecruiter,getUserById);
router.route('/getAllJobSeekers').get(protect,isRecruiter,getAllJobSeekers);
router.route('/getAllRecruiters').get(protect,getAllRecruiters);
router.route('/searchJobSeekers').get(protect,isRecruiter,searchJobSeekers);
router.route('/jobSeekersWithoutLikes/:recruiterId').get(protect, isRecruiter, getJobSeekersWithoutLikesByRecruiterId);
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