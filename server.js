import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/user-routes.js';
import jobApplicationRoutes from './routes/jobApplication-routes.js';
import jobOfferRoutes from './routes/job-offer-routes.js';
import jobNotificationRoutes from './routes/notification-routes.js';
import { errorHandler } from './middlewares/errors.middleware.js';
import {createNotification} from './controllers/notificationController.js';
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

app.set('view engine','ejs'); // set the view engine to ejs
//api routes
app.use('/api/users', userRoutes);
app.use('/api/job-offers', jobOfferRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/notifications', jobNotificationRoutes);

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

io.on('connection', (socket) => {
  console.log(chalk.blue(`User connected with socket id ${socket.id} and with a userid ${socket.userId}`));
console.log(socket);
  socket.join(socket.userId);

  //handle notification sending
  /*
        socket.on('notify',(notification)=>{
            console.log(notification);
            socket.broadcast("sendNotification",notification)
        });*/
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