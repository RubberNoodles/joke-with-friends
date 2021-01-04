const functions = require('firebase-functions');


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const { getAllJokes, postOneJoke, getJoke } = require('./handlers/jokes.js'); 
const { signup, login, uploadImage, uploadUserData, getUserData } = require('./handlers/users.js');
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

// obtain a specific joke basaed on the id
app.get('/joke/:jokeId', getJoke);

// signup route
app.post('/signup', signup);

// login route
app.post('/login', login);

// upload more user data
app.post('/user/data', FBAuth, uploadUserData);

// get ALL the data on a single user
app.get('/user/data', FBAuth, getUserData);

// the only way of sending data through a get request is via the url.

// uploading an image (as profile picture?)
app.post('/user/image', FBAuth, uploadImage);

exports.api = functions.https.onRequest(app);