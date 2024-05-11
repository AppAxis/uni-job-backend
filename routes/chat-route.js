import express from 'express';
import { createChat, getMessagesWithParticipants, sendMessage } from '../controllers/chatController.js';
import { protect,isRecruiter} from '../middlewares/auth.middleware.js';

const router = express.Router();
//Post Methods
// Route to  create Chat
router.route('/createChat').post(createChat);
// Route to send a message
router.route('/messages/send').post(sendMessage);
//Get Methods
// Route to get messages with participants
router.route('/messages').get(protect,getMessagesWithParticipants);



export default router;
