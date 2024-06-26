import { Router } from 'express';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import{
addJobOffer,
getAllJobOffers,
getJobOfferById,
searchJobOffer,
getAllJobOffersForRecruiter,
getJobOfferWithApplications,
fetchUserByApplicationId,
updateMyJobOffer,
deleteJobOffer,
passJobOffer,

} from '../controllers/jobOfferController.js';

const router = Router();

// Post methods
router.route('/addJobOffer').post(protect,isRecruiter,addJobOffer);


// GET Methods
router.route('/getAllJobOffers').get(protect,getAllJobOffers);
router.route("/jobOffer/:id").get(getJobOfferById);
router.route("/search").get(searchJobOffer);
router.route('/recruiterJobOffers').get(protect,isRecruiter, getAllJobOffersForRecruiter); 
router.route('/jobOfferWithApplications/:id').get(protect, isRecruiter, getJobOfferWithApplications); 

// PUT Methods
router.route("/updateJobOffer/:id").put(protect, isRecruiter, updateMyJobOffer);

// DELETE Methods
router.route("/deleteJobOffer/:id").delete(protect, isRecruiter, deleteJobOffer);
router.put('/pass/:jobId',protect, passJobOffer);


export default router;