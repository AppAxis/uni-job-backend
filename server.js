const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv').config();
const userRoutes = require('./routes/userRoute.js');
const errors = require("./middlewares/errors.js");
const passport = require('passport');
const session = require('express-session');
const port = process.env.PORT || 5000;
const app = express();

app.use(
    session({
      secret: process.env.SESSION_SECRET, // Add your session secret
      resave: false,
      saveUninitialized: true,
    })
  );
  

//database connection
const databaseName = 'UniJob-db';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

mongoose
    .connect(`mongodb://127.0.0.1:27017/${databaseName}`)
    .then(() => {
        console.log(`Connected to ${databaseName}`);
    })
    .catch(err => {
        console.log(err);
    });

// middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use("/img",express.static('uploads/images'));
app.use("/file",express.static('uploads/files'));

app.use('/api/users',userRoutes);


app.get('/', (req, res) => {
  res.send('welcome to UniJob');
});

app.use(errors.errorHandler);
// listen for requests
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
