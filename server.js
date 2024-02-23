import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoute.js';
import { errorHandler } from './middlewares/errors.js';
import passport from 'passport';
import session from 'express-session';

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
  .connect(`mongodb://127.0.0.1:27017/${databaseName}`,)
  .then(() => {
    console.log(`Connected to ${databaseName}`);
  })
  .catch((err) => {
    console.log(err);
  });

// middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(errorHandler);
app.use('/img', express.static('uploads/images'));
app.use('/file', express.static('uploads/files'));

app.set('view engine','ejs'); // set the view engine to ejs
//api routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('welcome to UniJob');
});



// listen for requests
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});