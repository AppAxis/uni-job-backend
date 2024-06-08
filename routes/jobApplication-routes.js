import { Router } from 'express';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import{applyForJob,getApplicationById,getApplicationsForJob,getApplicationsByJobSeeker, declineJobApplication, acceptJobApplication, getAllApplications} from '../controllers/jobApplicationController.js';



const router = Router();

// Post methods
router.route('/apply').post(protect,applyForJob); 


// GET Methods
router.route('/application/:id').get(protect, isRecruiter,getApplicationById);
router.route('/applications/:jobId').get(protect,isRecruiter,getApplicationsForJob);
router.route('/myApplication/:jobSeekerId').get(protect, getApplicationsByJobSeeker);
router.route('/allApplications').get(getAllApplications);

// PUT Methods
router.put('/application/decline/:applicationId',protect,declineJobApplication);
router.put('/application/accept/:applicationId',protect,acceptJobApplication);



export default router;