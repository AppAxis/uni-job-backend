import { Router } from 'express';
import { protect} from '../middlewares/auth.middleware.js';
import { getNotifications}from'../controllers/notificationController.js';

const router = Router();

// GET Methods
router.get('/getNotifications', protect, getNotifications);


export default router;