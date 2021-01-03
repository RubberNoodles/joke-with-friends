const functions = require('firebase-functions');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const { getAllJokes, postOneJoke } = require('./handlers/jokes.js'); 
const { signup, login, uploadImage } = require('./handlers/users.js');
const FBAuth = require('./util/FBAuth.js');

const express = require('express');
const app = express();

const firebase = require('firebase');
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

// joke routes

// GET method that receives all the jokes in the Jokes collection
// First parameter is the directory, second is the handler
app.get('/jokes', getAllJokes);

// create a joke
app.post('/joke', FBAuth, postOneJoke);

// signup route
app.post('/signup', signup);

// login route
app.post('/login', login);

// uploading an image
app.post('/user/image', uploadImage);

exports.api = functions.https.onRequest(app);