import { Router } from 'express';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';
import { initPayement,getPaymentDetails } from '../controllers/payementController.js';

const router = Router();

//Post methods
router.route('/initPayement').post(initPayement);


// Get methods
router.route('/paymentDetails/:paymentId').get(getPaymentDetails);



export default router;