import { Router } from 'express';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import{LikeJobSeeker,getAllLikesForJobSeeker,acceptLike,declineLike} from '../controllers/recruiterLikeController.js';
const router = Router();


// Post methods
router.route('/likeJobSeeker').post(protect,isRecruiter,LikeJobSeeker);  //add like to job seeker's profile
// GET Methods
router.route('/getLikes/:jobSeekerId').get(protect,getAllLikesForJobSeeker); 

// PUT methods
router.put('/acceptLike/:likeId', protect,acceptLike);
router.put('/declineLike/:likeId',protect, declineLike);



export default router;