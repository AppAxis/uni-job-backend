import { Router } from 'express';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import{applyForJob,getApplicationById} from '../controllers/jobApplicationController.js';



const router = Router();

// Post methods
router.route('/apply').post(protect,applyForJob); 
router.route('/application/:id').get(protect, isRecruiter,getApplicationById);

export default router;