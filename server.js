import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/user-routes.js';
import jobApplicationRoutes from './routes/jobApplication-routes.js';
import jobOfferRoutes from './routes/job-offer-routes.js';
import recruiterLikesRoutes from'./routes/recruiterLike-routes.js';
import jobNotificationRoutes from './routes/notification-routes.js';
import chatRoutes from './routes/chat-route.js';
import paymentRoutes from './routes/payement-route.js';
import { errorHandler } from './middlewares/errors.middleware.js';
import {createNotification} from './controllers/notificationController.js';
import { addSocketId, getUserConfigs } from './controllers/userConfigController.js';
import { sendMessage } from './controllers/chatController.js';
import passport from 'passport';
import session from 'express-session';
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import chalk from 'chalk';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// database connection
const databaseName = 'UniJob-db';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\x1b[33m%s\x1b[0m', 'Connection established with success to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

// middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(errorHandler);
app.use('/img', express.static('uploads/images'));
app.use('/file', express.static('uploads/files'));

app.set('view engine','ejs'); 
//api routes
app.use('/api/users', userRoutes);
app.use('/api/job-offers', jobOfferRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/notifications', jobNotificationRoutes);
app.use('/api/recruiterLikes',recruiterLikesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payements',paymentRoutes);

app.get('/', (req, res) => {
  res.send('welcome to UniJob');
});
// Setup HTTP server
const httpServer = createServer(app);
// Setup Socket.IO server
const io = new Server(httpServer)
console.log('\x1b[35m%s\x1b[0m', 'Socket.IO server created successfully.');

// Middleware to verify and set userId from token
io.use((socket, next) => {
  try {
    // Extract token from query parameters
    const token = socket.handshake.query.token;
    if (!token) {
      throw new Error("Token not provided");
    }

    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    console.log(chalk.blue(`User ${socket.userId} authenticated successfully.`));
    next();
  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

io.on('connection', async(socket) => {
  console.log(chalk.blue(`User connected with socket id ${socket.id} and with a userid ${socket.userId}`));
console.log(socket);
  socket.join(socket.userId);


  try {
    const { userId } = socket;
    const addSocketToUserResult = await addSocketId(userId, socket.id);
    console.log("Socket added with result ", addSocketToUserResult);
  } catch (error) {
    console.error("Error adding socket ID to user:", error);
  }
  
  // Handle sending messages
  socket.on("send-message", async (data) => {
    console.log(`Message sent by ${socket.userId}: ${data.message}`);
    const { receiverId, senderId, message ,chatId} = data;
    const userConfigs = await getUserConfigs(receiverId);
    console.log(userConfigs + "userConfig");
    sendMessage(chatId, senderId, message )

    const socketsIds = userConfigs.socketIds;
    console.log (socketsIds);
    for (const socketId of socketsIds) {
      io.to(socketId).emit("receive-message", {
        content: message,
        senderId: senderId,
      });
      
    }

  });
  socket.on("send-notification", async (data) => {
    
    // You can perform any additional logic here, such as fetching user configurations
    const { receiverId, senderId, message ,title} = data;
    console.log(`Notification sent to ${receiverId}: ${message}`);
    const userConfigs = await getUserConfigs(receiverId);

    // Emit the notification to all socket IDs associated with the receiver
    const socketsIds = userConfigs.socketIds;
    for (const socketId of socketsIds) {
      io.to(socketId).emit("receive-notification", {
        title: title,
        message: message,
        senderId: senderId,
        // You can include any additional data you want to send with the notification
      });
    }
  });
  
  // On the client side, you would listen for "receive-notification" events
  socket.on("receive-notification", (notification) => {
    console.log(`Received notification: ${notification.title}: ${notification.message}:${notification.senderId}`);
    // Handle the received notification, e.g., display it to the user
  }); 
  socket.on("notification", (notif) => {
    console.log(notif);
    socket.broadcast.emit("receive",createNotification(notif))
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    socket.leave(socket.userId);
    console.log(`Socket ${socket.id} disconnected due to ${reason}`);
  });
});

// listen for requests
httpServer.listen(port, () => {
  console.log(`\x1b[36mServer listening at http://localhost:${port}\x1b[0m`);
});