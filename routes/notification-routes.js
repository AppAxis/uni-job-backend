import { Router } from 'express';
import { protect} from '../middlewares/auth.middleware.js';
import {  createNotification, getNotificationsByReceiverId}from'../controllers/notificationController.js';

const router = Router();

// POST Methods
router.post('/', createNotification);

// GET Methods
router.get('/:receiverId', getNotificationsByReceiverId);


export default router;