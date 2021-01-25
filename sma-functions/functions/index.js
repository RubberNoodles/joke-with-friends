const functions = require('firebase-functions');

const { db } = require('./util/admin');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const {  
  getAllJokes, 
  postOneJoke, 
  getJokeData,
  commentOnJoke,
  likeJoke,
  unlikeJoke,
  deleteJoke } = require('./handlers/jokes.js'); 
  
const { 
  signup, 
  login, 
  uploadImage, 
  uploadUserData, 
  getPublicUserData,
  getUserData,
  markNotificationAsRead } = require('./handlers/users.js');


const FBAuth = require('./util/FBAuth.js');
const cors = require('cors');

const express = require('express');
const app = express();
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional

// joke routes

app.use(cors());
// GET method that receives all the jokes in the Jokes collection
// First parameter is the directory, second is the handler

app.get('/jokes', getAllJokes);
app.post('/joke', FBAuth, postOneJoke); // create a joke
app.get('/joke/:jokeId', getJokeData); // obtain a specific joke based on the id
app.post('/joke/:jokeId/comment', FBAuth, commentOnJoke); // comment on a specific joke
// like or unlike a joke
app.post('/joke/:jokeId/like', FBAuth, likeJoke);
app.post('/joke/:jokeId/unlike', FBAuth, unlikeJoke);
app.delete('/joke/:jokeId', FBAuth, deleteJoke); // delete joke
app.post('/signup', signup); // signup for an account, uses firebase Auth
app.post('/login', login); // login route
app.post('/user/data', FBAuth, uploadUserData); // upload more user data
app.get('/user/data', FBAuth, getUserData); // get ALL the data on a single user
app.get('/user/:handle', getPublicUserData); // for people who just want to access a certain person's profile; gets all the profile data
app.post('/user/image', FBAuth, uploadImage); // uploading an image (as profile picture?) 
app.post('/notification', FBAuth, markNotificationAsRead);// reading  notifications

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document(`likes/{id}`)
  .onCreate( snapshot => {
    db.doc(`/Jokes/${snapshot.data().jokeId}`).get()
    .then(doc => {
      if (doc.exists && doc.data().userHandle != snapshot.data().userHandle) {
        return db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().handle,
          sender: snapshot.data().userHandle,
          jokeId: snapshot.data().jokeId,
          type: "like",
          read: false
            })
          }
      })
    .catch( err => {
      console.error(err);
      return;
    })
});

exports.deleteNotificationOnUnlike = functions.firestore.document(`likes/{id}`)
.onDelete( snapshot => {
  return db.doc(`/notifications/${snapshot.id}`).delete()
  .catch( err=> {
    console.error(err);
    return;
  })
});

exports.createNotificationOnComment = functions.firestore.document(`comments/{id}`)
.onCreate( snapshot => {
  return db.doc(`/Jokes/${snapshot.data().jokeId}`).get()
  .then(doc => {
    if (doc.exists && doc.data().userHandle != snapshot.data().userHandle) {
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().handle,
        sender: snapshot.data().userHandle,
        jokeId: snapshot.data().jokeId,
        type: "comment",
        read: false
      })
    } else {
      console.error("Error: File not found")
      return; // idk wtf to do
    }
  })
  .catch( err=> {
    console.error(err);
    return;
  })
});

exports.changePictureOnUserUpdate = functions.firestore.document(`users/{handle}`)
.onUpdate( change => {
  const batch = db.batch();
  if (change.before.data().imageUrl !== change.after.data().imageUrl) {
    return db.collection(`Jokes`)
      .where("handle","==",change.before.data().handle)
      .get()
      .then( data => {
      data.forEach(doc => {
        batch.update(doc.ref, {"imageUrl": change.after.data().imageUrl});
      })
      return batch.commit();
    })
      .catch( err => {
      console.error(err);
      return;
    })
  }
});

exports.deleteDataOnJokeDelete = functions.firestore.document(`Jokes/{jokeId}`)
  .onDelete( (snapshot, context) => {
    const batch = db.batch();
    return db.collection("comments")
      .where("jokeId", "==",context.params.jokeId)
      .get()
      .then( data => {
        data.forEach( doc => {
          batch.delete(doc.ref);
        });
        return db.collection("likes")
          .where("jokeId","==", context.params.jokeId)
          .get();
      })
      .then( data => {
        data.forEach(doc => {
          batch.delete(doc.ref);
        });
        return db.collection("notifications")
          .where("jokeId","==", context.params.jokeId)
          .get();
      })
      .then( data => {
        data.forEach(doc => {
          batch.delete(doc.ref);
        });
        return batch.commit();        
      })
      .catch( err => {
        console.error(err);
      })
});
  